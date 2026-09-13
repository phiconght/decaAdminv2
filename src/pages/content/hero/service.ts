import { request } from '@umijs/max';
import type { HeroDetail, HeroForm } from './data';

// GET /api/v1/admin/home/hero → { success, data }
export async function getHero(): Promise<{
  success: boolean;
  data: HeroDetail;
}> {
  return request('/api/v1/admin/home/hero');
}

// PUT /api/v1/admin/home/hero
export async function updateHero(
  data: HeroForm,
): Promise<{ success: boolean; data: HeroDetail }> {
  return request('/api/v1/admin/home/hero', { method: 'PUT', data });
}
