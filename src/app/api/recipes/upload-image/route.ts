import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { writeFile, mkdir } from 'fs/promises';
import { analyzeFoodImage } from '@/lib/ai';
import path from 'path';
import sharp from 'sharp';

export const runtime = 'nodejs';

const MAX_IMAGE_DIM = 1024;

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('image') as File;

    if (!file || !file.size) {
      return NextResponse.json({ error: '请选择图片' }, { status: 400 });
    }

    if (file.size > 20 * 1024 * 1024) {
      return NextResponse.json({ error: '图片过大，请上传小于20MB的图片' }, { status: 400 });
    }

    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json({ error: '不支持的图片格式，请上传 JPG/PNG/WebP/HEIC' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // Save original image
    const ext = file.type === 'image/heic' || file.type === 'image/heif' ? 'jpg' : (file.type.split('/')[1] || 'jpg');
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    await mkdir(uploadDir, { recursive: true });

    let savedBuffer: Buffer = buffer;
    // Convert HEIC to JPEG for display
    if (file.type === 'image/heic' || file.type === 'image/heif') {
      savedBuffer = Buffer.from(await sharp(buffer).jpeg({ quality: 85 }).toBuffer());
    }
    await writeFile(path.join(uploadDir, filename), savedBuffer);

    const imageUrl = `/api/uploads/${filename}`;

    // Resize for AI analysis (max 1024px, JPEG, quality 75)
    const aiBuffer = Buffer.from(await sharp(buffer)
      .resize(MAX_IMAGE_DIM, MAX_IMAGE_DIM, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 75 })
      .toBuffer());

    const base64 = aiBuffer.toString('base64');
    console.log(`[upload-image] 图片已压缩: ${buffer.length} -> ${aiBuffer.length} bytes, base64: ${base64.length} chars`);

    // Analyze with AI
    console.log('[upload-image] 开始调用 AI 识别...');
    const analysis = await analyzeFoodImage(base64, 'image/jpeg');
    console.log('[upload-image] AI 识别结果:', analysis ? `成功, title="${analysis.title}"` : '失败(null)');

    if (!analysis) {
      // AI analysis failed — still save recipe but let user know
      const recipe = await prisma.recipe.create({
        data: {
          userId: session.user.id,
          title: file.name.replace(/\.[^.]+$/, '') || '未命名食谱',
          description: '通过图片上传添加的食谱（AI 识别失败）',
          servings: 2,
          cookTime: 30,
          imageUrl,
          tags: '自上传',
          ingredients: '[]',
          steps: '[]',
          source: '图片上传',
        },
      });
      return NextResponse.json({
        id: recipe.id,
        imageUrl,
        aiGenerated: false,
        warning: 'AI 无法识别该图片中的菜品，请手动编辑食谱信息',
      });
    }

    // Check if AI returned valid-looking results
    if (!analysis.title || analysis.title.length < 2) {
      const recipe = await prisma.recipe.create({
        data: {
          userId: session.user.id,
          title: file.name.replace(/\.[^.]+$/, '') || '未命名食谱',
          description: '通过图片上传添加的食谱',
          servings: 2,
          cookTime: 30,
          imageUrl,
          tags: '自上传',
          ingredients: '[]',
          steps: '[]',
          source: '图片上传',
        },
      });
      return NextResponse.json({
        id: recipe.id,
        imageUrl,
        aiGenerated: false,
        warning: '未能识别图片中的菜品，可能不是食物图片，请重新上传',
      });
    }

    const title = analysis.title;
    const description = analysis.description || '';
    const cookTime = analysis.cookTime || 30;
    const servings = analysis.servings || 2;
    const tags = (analysis.tags || []).join(',');
    const ingredients = JSON.stringify(analysis.ingredients || []);
    const steps = JSON.stringify(analysis.steps || []);

    const recipe = await prisma.recipe.create({
      data: {
        userId: session.user.id,
        title,
        description,
        servings,
        cookTime,
        imageUrl,
        tags,
        ingredients,
        steps,
        source: '图片上传+AI识别',
      },
    });

    return NextResponse.json({ id: recipe.id, imageUrl, aiGenerated: true });
  } catch (error) {
    console.error('Upload image error:', error);
    return NextResponse.json({ error: '上传失败，请重试' }, { status: 500 });
  }
}
