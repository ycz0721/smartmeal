'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Upload, Camera, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

const TAG_OPTIONS = ['快手菜', '素食', '肉类', '海鲜', '汤羹', '适合儿童'];

export default function AddRecipePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [quickAddName, setQuickAddName] = useState('');
  const galleryRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);

  // Tag picker state
  const [tagPickerOpen, setTagPickerOpen] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [pendingRecipeId, setPendingRecipeId] = useState<string | null>(null);

  const handleQuickAdd = async () => {
    if (!quickAddName.trim()) {
      toast.error('请输入菜名');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/recipes/quick-add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dishName: quickAddName }),
      });
      if (res.ok) {
        const data = await res.json();
        toast.success('食谱添加成功');
        // Show tag picker
        setPendingRecipeId(data.id);
        setSelectedTags([]);
        setTagPickerOpen(true);
      } else {
        toast.error('添加失败，请重试');
      }
    } catch {
      toast.error('添加失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleConfirmTags = async () => {
    if (selectedTags.length === 0 || !pendingRecipeId) {
      setTagPickerOpen(false);
      router.push('/recipes');
      return;
    }

    try {
      await fetch(`/api/recipes/${pendingRecipeId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tags: selectedTags.join(',') }),
      });
    } catch {}

    setTagPickerOpen(false);
    router.push('/recipes');
  };

  const uploadImage = async (file: File) => {
    setLoading(true);
    const toastId = toast.loading('正在识别菜品信息...');
    try {
      const formData = new FormData();
      formData.append('image', file);

      const res = await fetch('/api/recipes/upload-image', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        toast.dismiss(toastId);
        if (data.aiGenerated) {
          toast.success('AI 已识别菜名和做法');
        } else if (data.warning) {
          toast.warning(data.warning);
        } else {
          toast.success('图片上传成功，请手动填写食谱信息');
        }
        router.push(`/recipes/${data.id}`);
      } else {
        toast.dismiss(toastId);
        const err = await res.json();
        toast.error(err.error || '上传失败');
      }
    } catch {
      toast.dismiss(toastId);
      toast.error('上传失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadImage(file);
    e.target.value = '';
  };

  return (
    <div className="p-4 space-y-6">
      <div>
        <h1 className="text-page-title text-brand-text">添加到我的食谱</h1>
        <p className="text-sm text-brand-secondary mt-1">请选择以下方式开始</p>
      </div>

      {/* Gallery: file picker only */}
      <input
        ref={galleryRef}
        type="file"
        accept="image/png, image/jpeg, image/webp, image/heic, image/heif"
        className="hidden"
        onChange={handleFileChange}
      />
      {/* Camera: open camera directly */}
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Quick Add Card */}
      <Card className="p-4 border border-orange-500">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-orange-500" />
          </div>
          <span className="font-bold text-brand-text">快速添加</span>
        </div>
        <p className="text-sm text-brand-secondary mb-3">只需告诉我们菜名</p>
        <Input
          placeholder="请输入菜名，如：宫保鸡丁"
          value={quickAddName}
          onChange={(e) => setQuickAddName(e.target.value)}
          className="mb-3"
        />
        <Button className="w-full h-12 rounded-lg" onClick={handleQuickAdd} disabled={loading}>
          {loading ? '添加中...' : '添加食谱'}
        </Button>
      </Card>

      {/* Divider */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-[#EEEEEE]" />
        <span className="text-sm text-brand-secondary whitespace-nowrap">或通过更多方式添加</span>
        <div className="flex-1 h-px bg-[#EEEEEE]" />
      </div>

      {/* Other Methods */}
      <div className="space-y-0">
        {[
          { icon: Upload, label: '上传图片', desc: '从相册选择照片', ref: galleryRef },
          { icon: Camera, label: '拍摄照片', desc: '直接拍照上传', ref: cameraRef },
        ].map((item) => (
          <button
            key={item.label}
            className="w-full flex items-center gap-4 py-4 border-b border-[#EEEEEE] last:border-0"
            onClick={() => item.ref?.current?.click()}
            disabled={loading}
          >
            <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center">
              <item.icon className="w-5 h-5 text-orange-500" />
            </div>
            <div className="flex-1 text-left">
              <div className="text-sm font-medium text-brand-text">{item.label}</div>
              <div className="text-xs text-brand-secondary">{item.desc}</div>
            </div>
            <div className="text-brand-secondary">
              <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.293 4.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L10.586 9 7.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>
          </button>
        ))}
      </div>

      {/* Tag Picker Dialog */}
      <Dialog open={tagPickerOpen} onOpenChange={setTagPickerOpen}>
        <DialogContent className="w-[90vw] max-w-md rounded-xl">
          <DialogTitle className="text-center text-brand-text">选择分类标签</DialogTitle>
          <p className="text-center text-sm text-brand-secondary mt-1">为该食谱添加标签以便筛选</p>
          <div className="flex flex-wrap gap-2 mt-4 justify-center">
            {TAG_OPTIONS.map((tag) => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                  selectedTags.includes(tag)
                    ? 'bg-orange-500 text-white border-orange-500'
                    : 'bg-white text-orange-500 border-orange-500'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
          <div className="flex gap-3 mt-6">
            <Button
              variant="secondary"
              className="flex-1 h-10"
              onClick={() => {
                setTagPickerOpen(false);
                router.push('/recipes');
              }}
            >
              跳过
            </Button>
            <Button className="flex-1 h-10" onClick={handleConfirmTags}>
              确认{selectedTags.length > 0 ? ` (${selectedTags.length})` : ''}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
