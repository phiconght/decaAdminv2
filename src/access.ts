/**
 * @see https://umijs.org/docs/max/access#access
 * */
export default function access(
  initialState: { currentUser?: API.CurrentUser } | undefined,
) {
  const { currentUser } = initialState ?? {};
  // currentUser được map ở services/auth.ts (có roles[] + permissions[]) rồi cast sang API.CurrentUser.
  const perms: string[] =
    (currentUser as { permissions?: string[] } | undefined)?.permissions ?? [];
  const has = (code: string) => perms.includes(code);

  return {
    canAdmin: currentUser && currentUser.access === 'admin',
    /** Kiểm 1 quyền RESOURCE:ACTION bất kỳ (dùng trong component qua useAccess().hasPerm('X')). */
    hasPerm: has,
    // Lịch học / Phòng / Lớp / Nghỉ phép / Người dùng
    canReadRoom: has('ROOM:READ'),
    canWriteRoom: has('ROOM:WRITE'),
    canReadClass: has('CLASS:READ'),
    canWriteClass: has('CLASS:WRITE'),
    canReadLeave: has('LEAVE:READ'),
    canWriteLeave: has('LEAVE:WRITE'),
    canApproveLeave: has('LEAVE:APPROVE'),
    canReadUser: has('USER:READ'),
    canWriteUser: has('USER:WRITE'),
  };
}
