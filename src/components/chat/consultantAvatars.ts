export type ConsultantAvatarCrop = {
  src: string;
  x: number;
  y: number;
  size: number;
  sourceWidth: number;
  sourceHeight: number;
};

const columns = [67, 291, 515, 738, 961];
const rows = [344, 605, 866, 1127, 1388, 1649, 1910];

const fromScreenshot = (src: string): ConsultantAvatarCrop[] =>
  rows.flatMap((y) =>
    columns.map((x) => ({
      src,
      x,
      y,
      size: 150,
      sourceWidth: 1179,
      sourceHeight: 2556,
    })),
  );

export const CONSULTANT_AVATARS = [
  ...fromScreenshot("img/wechat-consultants/contacts-01.png"),
  ...fromScreenshot("img/wechat-consultants/contacts-02.png"),
] as const;

export const selectConsultantAvatar = (date: string) => {
  const day = Math.floor(Date.parse(`${date}T00:00:00Z`) / 86_400_000);
  if (!Number.isFinite(day)) throw new Error(`日期格式无效: ${date}`);
  return CONSULTANT_AVATARS[
    ((day % CONSULTANT_AVATARS.length) + CONSULTANT_AVATARS.length) %
      CONSULTANT_AVATARS.length
  ];
};
