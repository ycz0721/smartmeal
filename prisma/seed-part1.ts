import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const recipes = [
  {
    title: '宫保鸡丁',
    description: '经典川菜，鸡肉鲜嫩，花生酥脆，酸甜微辣',
    servings: 4,
    cookTime: 25,
    imageUrl: 'https://images.unsplash.com/photo-1603073163308-9c4f7d4e0c8e?w=800',
    tags: '中餐,川菜,快手,晚餐',
    ingredients: JSON.stringify([
      { name: '鸡胸肉', amount: 300, unit: 'g' },
      { name: '花生米', amount: 80, unit: 'g' },
      { name: '干辣椒', amount: 10, unit: '个' },
      { name: '葱', amount: 2, unit: '根' },
      { name: '姜', amount: 1, unit: '块' },
      { name: '蒜', amount: 3, unit: '瓣' },
      { name: '生抽', amount: 2, unit: '勺' },
      { name: '醋', amount: 1, unit: '勺' },
      { name: '糖', amount: 1, unit: '勺' },
      { name: '淀粉', amount: 1, unit: '勺' },
    ]),
    steps: JSON.stringify([
      '鸡胸肉切丁，加生抽、淀粉腌制15分钟',
      '花生米炸至金黄捞出',
      '热油爆香干辣椒、葱姜蒜',
      '下鸡丁快速翻炒至变色',
      '加入生抽、醋、糖调味',
      '最后加入花生米翻炒均匀即可',
    ]),
    source: 'seed',
  },
  {
    title: '番茄炒蛋',
    description: '国民家常菜，酸甜开胃，营养丰富',
    servings: 2,
    cookTime: 10,
    imageUrl: 'https://images.unsplash.com/photo-1608897013039-887f21d8c804?w=800',
    tags: '中餐,家常,快手,早餐',
    ingredients: JSON.stringify([
      { name: '番茄', amount: 3, unit: '个' },
      { name: '鸡蛋', amount: 4, unit: '个' },
      { name: '葱', amount: 1, unit: '根' },
      { name: '盐', amount: 1, unit: '茶勺' },
      { name: '糖', amount: 0.5, unit: '勺' },
    ]),
    steps: JSON.stringify([
      '番茄切块，鸡蛋打散加少许盐',
      '热油炒鸡蛋至凝固盛出',
      '锅中加油炒番茄至出汁',
      '加盐和糖调味',
      '倒入鸡蛋翻炒均匀',
      '撒葱花出锅',
    ]),
