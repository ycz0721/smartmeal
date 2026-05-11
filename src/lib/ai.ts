import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: 'https://api.deepseek.com/v1',
});

const zhipuClient = new OpenAI({
  apiKey: process.env.ZHIPU_API_KEY,
  baseURL: 'https://open.bigmodel.cn/api/paas/v4/',
});

export async function callAI<T>(systemPrompt: string, userPrompt: string): Promise<T> {
  const response = await client.chat.completions.create({
    model: 'deepseek-v4-flash',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    response_format: { type: 'json_object' },
  }, { timeout: 30000 });

  const content = response.choices[0].message.content || '{}';
  return JSON.parse(content) as T;
}

interface RecipeAnalysis {
  title: string;
  description: string;
  cookTime: number;
  servings: number;
  tags: string[];
  ingredients: { name: string; amount: number; unit: string }[];
  steps: string[];
}

export async function analyzeFoodImage(base64Image: string, mimeType: string): Promise<RecipeAnalysis | null> {
  try {
    const response = await zhipuClient.chat.completions.create({
      model: 'glm-4v-flash',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `请分析这张食物图片，识别菜品并给出完整食谱。必须返回纯 JSON（不要markdown代码块）：
{
  "title": "菜名",
  "description": "一句话简介",
  "cookTime": 30,
  "servings": 2,
  "tags": ["快手菜", "下饭"],
  "ingredients": [{"name": "食材名", "amount": 100, "unit": "克"}],
  "steps": ["第1步：...", "第2步：...", "第3步：...", "第4步：..."]
}

要求：
- title 用中文菜名
- ingredients 至少4种食材，单位统一用：克、毫升、个、茶匙、汤匙、根、瓣
- steps 至少4步，详细可操作
- tags 2-3个中文标签
- cookTime 单位分钟
- 只返回 JSON，不要任何其他文字`,
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:${mimeType};base64,${base64Image}`,
              },
            },
          ],
        },
      ],
      max_tokens: 1000,
    });

    const content = response.choices[0].message.content || '';
    // Handle possible markdown code block wrapping
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;
    return JSON.parse(jsonMatch[0]) as RecipeAnalysis;
  } catch (error: any) {
    console.error('=== AI Vision 识别失败 ===');
    console.error('message:', error.message);
    console.error('status:', error.status);
    console.error('code:', error.code);
    console.error('type:', error.type);
    if (error.response) {
      console.error('response.status:', error.response.status);
      console.error('response.data:', JSON.stringify(error.response.data || {}));
    }
    console.error('full error:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
    console.error('===========================');
    return null;
  }
}

const MEAL_TYPE_CN: Record<string, string> = {
  breakfast: '早餐',
  lunch: '午餐',
  dinner: '晚餐',
};

export async function generateMealPlan(params: {
  prompt?: string;
  cuisines: string[];
  intolerances: string[];
  dietary: string[];
  familySize: number;
  days: number;
  mealTypes?: string[];
  dishCombo?: string;
  recentDishes?: string[];
  pantryItems?: { name: string; amount: number; unit: string }[];
}) {
  const extraContext = params.prompt
    ? `用户备注：${params.prompt}\n`
    : '';

  const mealTypes = params.mealTypes || ['dinner'];
  const dishCombo = params.dishCombo || '一荤一素一汤';
  const mealTypesCN = mealTypes.map((m) => MEAL_TYPE_CN[m] || m).join('、');

  // Determine dishes per meal
  let dishesHint = '每餐只需要1道菜';
  if (dishCombo.includes('一荤一素一汤')) dishesHint = '每餐需要3道：1个荤菜、1个素菜、1个汤';
  else if (dishCombo.includes('一荤两素')) dishesHint = '每餐需要3道：1个荤菜、2个素菜';
  else if (dishCombo.includes('两荤一素')) dishesHint = '每餐需要3道：2个荤菜、1个素菜';
  else if (dishCombo.includes('一荤一素')) dishesHint = '每餐需要2道：1个荤菜、1个素菜';
  else if (dishCombo.includes('一菜一汤')) dishesHint = '每餐需要2道：1个菜、1个汤';

  // Recent dishes to avoid
  const recentCtx = params.recentDishes && params.recentDishes.length > 0
    ? `- 【重要】以下菜品是用户最近已经做过的，本次生成必须全部避开，不能出现任何相同或高度相似的菜品：\n  ${params.recentDishes.join('、')}\n- 请发挥创意，给出与上述列表完全不同的新菜品\n`
    : '';

  // Pantry context
  const pantryList = params.pantryItems || [];
  const pantryCtx = pantryList.length > 0
    ? `- 【重要】你的冰箱目前有以下食材，请优先设计能消耗这些食材的菜品，减少额外购买：\n  ${pantryList.map((p) => `${p.name} ${p.amount}${p.unit}`).join('、')}\n- 尽量使用冰箱现有食材，但不要因此牺牲菜品的多样性和营养均衡\n`
    : '';

  const systemPrompt = `你是一名专业膳食计划师。根据用户需求生成膳食计划，必须返回 JSON。

输出 JSON 结构（每餐是一个 dishes 数组）：
{
  "meals": [
    {
      "day": "第1天",
      "dinner": {
        "dishes": [
          { "name": "荤菜名", "nameEn": "Meat Dish", "ingredients": [{"name":"食材","amount":100,"unit":"克"}], "steps": ["详细步骤1","详细步骤2"], "cookTime": 25, "tags": ["荤菜","下饭"], "description": "一句话简介" },
          { "name": "素菜名", "nameEn": "Veggie Dish", "ingredients": [{"name":"食材","amount":100,"unit":"克"}], "steps": ["详细步骤1","详细步骤2"], "cookTime": 15, "tags": ["素菜","清淡"], "description": "一句话简介" },
          { "name": "汤名", "nameEn": "Soup", "ingredients": [{"name":"食材","amount":100,"unit":"克"}], "steps": ["详细步骤1","详细步骤2"], "cookTime": 15, "tags": ["汤品","营养"], "description": "一句话简介" }
        ]
      }
    }
  ]
}

要求：
- 需要的餐次：${mealTypesCN}
- ${dishesHint}
- 每道菜必须有详细步骤（至少4步），不可省略
- 所有菜名、描述、步骤均用中文
- 每道菜必须提供英文名 nameEn 字段，格式如 "Kung Pao Chicken"
- 食材单位统一用：克、毫升、个、茶匙、汤匙、根、瓣
- 人数：${params.familySize}人
- 菜系偏好：${params.cuisines.join('、') || '不限'}
- 饮食限制：${params.dietary.join('、') || '无'}
- 不耐受食材：${params.intolerances.join('、') || '无'}
- 步骤要具体可操作，不要只说"调味"而要写明加什么调料
${recentCtx}${pantryCtx}`;

  const userPrompt = `请为我生成${params.days}天的膳食计划，只包含${mealTypesCN}。${extraContext}`;

  return callAI<{ meals: any[] }>(systemPrompt, userPrompt);
}
