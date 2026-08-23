import dayjs from 'dayjs';
import type { Request, Response } from 'express';
import type { DataItem, OfflineDataType, SearchDataType } from './data.d';

// mock data
const visitData: DataItem[] = [];
const beginDay = Date.now();

const fakeY = [7, 5, 4, 2, 4, 7, 5, 6, 5, 9, 6, 3, 1, 5, 3, 6, 5];
for (let i = 0; i < fakeY.length; i += 1) {
  visitData.push({
    x: dayjs(new Date(beginDay + 1000 * 60 * 60 * 24 * i)).format('YYYY-MM-DD'),
    y: fakeY[i],
  });
}

const visitData2: DataItem[] = [];
const fakeY2 = [1, 6, 4, 8, 3, 7, 2];
for (let i = 0; i < fakeY2.length; i += 1) {
  visitData2.push({
    x: dayjs(new Date(beginDay + 1000 * 60 * 60 * 24 * i)).format('YYYY-MM-DD'),
    y: fakeY2[i],
  });
}

const salesData: DataItem[] = [];
for (let i = 0; i < 12; i += 1) {
  salesData.push({
    x: `Tháng ${i + 1}`,
    y: Math.floor(Math.random() * 1000) + 200,
  });
}
const searchData: SearchDataType[] = [];
for (let i = 0; i < 50; i += 1) {
  searchData.push({
    index: i + 1,
    keyword: `Từ khóa tìm kiếm-${i}`,
    count: Math.floor(Math.random() * 1000),
    range: Math.floor(Math.random() * 100),
    status: Math.floor((Math.random() * 10) % 2),
  });
}
const salesTypeData = [
  {
    x: 'Thiết bị gia dụng',
    y: 4544,
  },
  {
    x: 'Đồ uống rượu',
    y: 3321,
  },
  {
    x: 'Chăm sóc cá nhân và sức khỏe',
    y: 3113,
  },
  {
    x: 'Quần áo và túi xách',
    y: 2341,
  },
  {
    x: 'Sản phẩm mẹ và bé',
    y: 1231,
  },
  {
    x: 'Khác',
    y: 1231,
  },
];

const salesTypeDataOnline = [
  {
    x: 'Thiết bị gia dụng',
    y: 244,
  },
  {
    x: 'Đồ uống rượu',
    y: 321,
  },
  {
    x: 'Chăm sóc cá nhân và sức khỏe',
    y: 311,
  },
  {
    x: 'Quần áo và túi xách',
    y: 41,
  },
  {
    x: 'Sản phẩm mẹ và bé',
    y: 121,
  },
  {
    x: 'Khác',
    y: 111,
  },
];

const salesTypeDataOffline = [
  {
    x: 'Thiết bị gia dụng',
    y: 99,
  },
  {
    x: 'Đồ uống rượu',
    y: 188,
  },
  {
    x: 'Chăm sóc cá nhân và sức khỏe',
    y: 344,
  },
  {
    x: 'Quần áo và túi xách',
    y: 255,
  },
  {
    x: 'Khác',
    y: 65,
  },
];

const offlineData: OfflineDataType[] = [];
for (let i = 0; i < 10; i += 1) {
  offlineData.push({
    name: `Stores ${i}`,
    cvr: Math.ceil(Math.random() * 9) / 10,
  });
}
const offlineChartData: DataItem[] = [];
for (let i = 0; i < 20; i += 1) {
  offlineChartData.push({
    x: Date.now() + 1000 * 60 * 30 * i,
    y1: Math.floor(Math.random() * 100) + 10,
    y2: Math.floor(Math.random() * 100) + 10,
  });
}

const titles = [
  'Alipay',
  'Angular',
  'Ant Design',
  'Ant Design Pro',
  'Bootstrap',
  'React',
  'Vue',
  'Webpack',
];
const avatars = [
  'https://gw.alipayobjects.com/zos/rmsportal/WdGqmHpayyMjiEhcKoVE.png', // Alipay
  'https://gw.alipayobjects.com/zos/rmsportal/zOsKZmFRdUtvpqCImOVY.png', // Angular
  'https://gw.alipayobjects.com/zos/rmsportal/dURIMkkrRFpPgTuzkwnB.png', // Ant Design
  'https://gw.alipayobjects.com/zos/rmsportal/sfjbOqnsXXJgNCjCzDBL.png', // Ant Design Pro
  'https://gw.alipayobjects.com/zos/rmsportal/siCrBXXhmvTQGWPNLBow.png', // Bootstrap
  'https://gw.alipayobjects.com/zos/rmsportal/kZzEzemZyKLKFsojXItE.png', // React
  'https://gw.alipayobjects.com/zos/rmsportal/ComBAopevLwENQdKWiIn.png', // Vue
  'https://gw.alipayobjects.com/zos/rmsportal/nxkuOJlFJuAUhzlMTCEe.png', // Webpack
];

const avatars2 = [
  'https://gw.alipayobjects.com/zos/rmsportal/BiazfanxmamNRoxxVxka.png',
  'https://gw.alipayobjects.com/zos/rmsportal/cnrhVkzwxjPwAaCfPbdc.png',
  'https://gw.alipayobjects.com/zos/rmsportal/gaOngJwsRYRaVAuXXcmB.png',
  'https://gw.alipayobjects.com/zos/rmsportal/ubnKSIfAJTxIgXOKlciN.png',
  'https://gw.alipayobjects.com/zos/rmsportal/WhxKECPNujWoWEFNdnJE.png',
  'https://gw.alipayobjects.com/zos/rmsportal/jZUIxmJycoymBprLOUbT.png',
  'https://gw.alipayobjects.com/zos/rmsportal/psOgztMplJMGpVEqfcgF.png',
  'https://gw.alipayobjects.com/zos/rmsportal/ZpBqSxLxVEXfcUNoPKrz.png',
  'https://gw.alipayobjects.com/zos/rmsportal/laiEnJdGHVOhJrUShBaJ.png',
  'https://gw.alipayobjects.com/zos/rmsportal/UrQsqscbKEpNuJcvBZBu.png',
];

const getNotice = (_: Request, res: Response) => {
  res.json({
    data: [
      {
        id: 'xxx1',
        title: titles[0],
        logo: avatars[0],
        description: 'Đó là điều gì đó bên trong, họ không thể đạt tới nó',
        updatedAt: new Date(),
        member: 'Nhóm di chuyển khoa học',
        href: '',
        memberLink: '',
      },
      {
        id: 'xxx2',
        title: titles[1],
        logo: avatars[1],
        description:
          'Hy vọng là điều tốt, có thể là tốt nhất, những điều tốt không bao giờ chết',
        updatedAt: new Date('2017-07-24'),
        member: 'Toàn bộ nhóm đều là Daniel Wu',
        href: '',
        memberLink: '',
      },
      {
        id: 'xxx3',
        title: titles[2],
        logo: avatars[2],
        description:
          'Có rất nhiều quán rượu trong thị trấn, nhưng cô ấy lại bước vào quán của tôi',
        updatedAt: new Date(),
        member: 'Nhóm cô gái cấp hai',
        href: '',
        memberLink: '',
      },
      {
        id: 'xxx4',
        title: titles[3],
        logo: avatars[3],
        description:
          'Lúc đó, tôi chỉ nghĩ về những gì tôi muốn, không bao giờ nghĩ về những gì tôi sở hữu',
        updatedAt: new Date('2017-07-23'),
        member: 'Lập trình viên hàng ngày',
        href: '',
        memberLink: '',
      },
      {
        id: 'xxx5',
        title: titles[4],
        logo: avatars[4],
        description: 'Mùa đông chính sẽ tới',
        updatedAt: new Date('2017-07-23'),
        member: 'Nhóm thiết kế sang trọng',
        href: '',
        memberLink: '',
      },
      {
        id: 'xxx6',
        title: titles[5],
        logo: avatars[5],
        description: 'Cuộc sống như một hộp sô cô la, kết quả luôn bất ngờ',
        updatedAt: new Date('2017-07-23'),
        member: 'Lừa bạn học Khoa học Máy tính',
        href: '',
        memberLink: '',
      },
    ],
  });
};

const getActivities = (_: Request, res: Response) => {
  res.json({
    data: [
      {
        id: 'trend-1',
        updatedAt: new Date(),
        user: {
          name: 'Qu Lili',
          avatar: avatars2[0],
        },
        group: {
          name: 'Nhóm thiết kế sang trọng',
          link: 'https://github.com/',
        },
        project: {
          name: 'Lần lặp tháng 6',
          link: 'https://github.com/',
        },
        template: 'Tạo dự án mới @{project} trong @{group}',
      },
      {
        id: 'trend-2',
        updatedAt: new Date(),
        user: {
          name: 'Fu Xiaoxiao',
          avatar: avatars2[1],
        },
        group: {
          name: 'Nhóm thiết kế sang trọng',
          link: 'https://github.com/',
        },
        project: {
          name: 'Lần lặp tháng 6',
          link: 'https://github.com/',
        },
        template: 'Tạo dự án mới @{project} trong @{group}',
      },
      {
        id: 'trend-3',
        updatedAt: new Date(),
        user: {
          name: 'Lin Dongdong',
          avatar: avatars2[2],
        },
        group: {
          name: 'Nhóm cô gái cấp hai',
          link: 'https://github.com/',
        },
        project: {
          name: 'Lần lặp tháng 6',
          link: 'https://github.com/',
        },
        template: 'Tạo dự án mới @{project} trong @{group}',
      },
      {
        id: 'trend-4',
        updatedAt: new Date(),
        user: {
          name: 'Zhou Xingxing',
          avatar: avatars2[4],
        },
        project: {
          name: 'Lần lặp hàng ngày tháng 5',
          link: 'https://github.com/',
        },
        template: 'Cập nhật @{project} thành trạng thái đã phát hành',
      },
      {
        id: 'trend-5',
        updatedAt: new Date(),
        user: {
          name: 'Zhu Pianyou',
          avatar: avatars2[3],
        },
        project: {
          name: 'Hiệu quả kỹ thuật',
          link: 'https://github.com/',
        },
        comment: {
          name: 'Bình luận',
          link: 'https://github.com/',
        },
        template: 'Đã phát hành @{comment} trong @{project}',
      },
      {
        id: 'trend-6',
        updatedAt: new Date(),
        user: {
          name: 'Le Ge',
          avatar: avatars2[5],
        },
        group: {
          name: 'Lập trình viên hàng ngày',
          link: 'https://github.com/',
        },
        project: {
          name: 'Lần lặp thương hiệu',
          link: 'https://github.com/',
        },
        template: 'Tạo dự án mới @{project} trong @{group}',
      },
    ],
  });
};

const radarOriginData = [
  {
    name: 'Cá nhân',
    ref: 10,
    koubei: 8,
    output: 4,
    contribute: 5,
    hot: 7,
  },
  {
    name: 'Đội',
    ref: 3,
    koubei: 9,
    output: 6,
    contribute: 3,
    hot: 1,
  },
  {
    name: 'Phòng ban',
    ref: 4,
    koubei: 1,
    output: 6,
    contribute: 5,
    hot: 7,
  },
];

const radarData: any[] = [];
const radarTitleMap = {
  ref: 'Trích dẫn',
  koubei: 'Danh tiếng',
  output: 'Sản lượng',
  contribute: 'Đóng góp',
  hot: 'Độ nóng',
};
radarOriginData.forEach((item) => {
  Object.keys(item).forEach((key) => {
    if (key !== 'name') {
      radarData.push({
        name: item.name,
        label: radarTitleMap[key as 'ref'],
        value: item[key as 'ref'],
      });
    }
  });
});

const getChartData = (_: Request, res: Response) => {
  res.json({
    data: {
      visitData,
      visitData2,
      salesData,
      searchData,
      offlineData,
      offlineChartData,
      salesTypeData,
      salesTypeDataOnline,
      salesTypeDataOffline,
      radarData,
    },
  });
};

export default {
  'GET  /api/project/notice': getNotice,
  'GET  /api/activities': getActivities,
  'GET  /api/fake_workplace_chart_data': getChartData,
};
