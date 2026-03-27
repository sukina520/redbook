export const availableTags = ['学习', '社团', '探店', '运动', '穿搭', '摄影', '求职', '二手']

export const campusTrends = [
  { keyword: '图书馆抢座攻略', heat: 9021 },
  { keyword: '操场夜跑搭子', heat: 6380 },
  { keyword: '食堂新品测评', heat: 5122 },
  { keyword: '社团招新避坑', heat: 3223 }
]

export const defaultTopics = [
  {
    id: 1,
    name: '#春日校园穿搭',
    description: '记录每天在校园里最上镜的一套穿搭。',
    participants: 276,
    notes: 1120,
    heat: 98,
    cover: 'https://picsum.photos/seed/topic-style/800/480'
  },
  {
    id: 2,
    name: '#期末自习室打卡',
    description: '图书馆、自习室、空教室都欢迎来晒。',
    participants: 421,
    notes: 2048,
    heat: 96,
    cover: 'https://picsum.photos/seed/topic-study/800/480'
  },
  {
    id: 3,
    name: '#食堂新品实测',
    description: '每周一起帮大家判断哪家窗口值得排队。',
    participants: 188,
    notes: 689,
    heat: 89,
    cover: 'https://picsum.photos/seed/topic-food/800/480'
  }
]

export const defaultUserProfile = {
  id: 'demo-user',
  name: '小林同学',
  bio: '在校园里认真生活，也认真记录。',
  avatar: 'https://picsum.photos/seed/avatar-lin/120/120',
  tags: ['学习', '运动', '探店'],
  history: [101, 103],
  likes: [103],
  favorites: [{ noteId: 101, folderId: 'default' }],
  favoriteFolders: [
    { id: 'default', name: '默认收藏夹' },
    { id: 'study', name: '学习灵感' }
  ]
}

export const defaultNotes = [
  {
    id: 101,
    title: '图书馆四楼超安静，复习效率拉满',
    content: '靠窗位置下午阳光很舒服，推荐带耳机和保温杯，三点后人会明显变多。',
    author: '小林同学',
    authorId: 'demo-user',
    type: 'image',
    media: ['https://picsum.photos/seed/library/640/840'],
    tags: ['学习'],
    topicId: 2,
    likes: 118,
    favorites: 43,
    comments: [
      {
        id: 1001,
        author: '阿奇',
        authorId: 'user-2',
        content: '确实，晚上七点以后也挺稳。',
        deleted: false,
        parentId: null,
        createdAt: Date.now() - 1000 * 60 * 15
      }
    ],
    createdAt: Date.now() - 1000 * 60 * 30,
    subtitle: '',
    cover: 'https://picsum.photos/seed/library/640/840',
    interactions: {
      views: 250,
      likedUsers: [],
      favoredUsers: ['demo-user']
    }
  },
  {
    id: 102,
    title: '15 秒操场夜跑 vlog',
    content: '今天 5km 完成，配速 5:40。风有点大，但跑起来特别舒服。',
    author: '跑步喵',
    authorId: 'user-3',
    type: 'video',
    media: ['https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4'],
    tags: ['运动'],
    topicId: 1,
    likes: 186,
    favorites: 60,
    comments: [],
    createdAt: Date.now() - 1000 * 60 * 60 * 5,
    subtitle: '坚持打卡第 12 天',
    cover: 'https://picsum.photos/seed/run-cover/640/840',
    interactions: {
      views: 460,
      likedUsers: [],
      favoredUsers: []
    }
  },
  {
    id: 103,
    title: '食堂新开的轻食窗口值得冲吗？',
    content: '鸡胸肉和玉米杯意外地很顶，价格也比校外便宜一点，适合减脂期。',
    author: '饭搭子阿圆',
    authorId: 'user-4',
    type: 'image',
    media: ['https://picsum.photos/seed/canteen/640/780'],
    tags: ['探店', '运动'],
    topicId: 3,
    likes: 95,
    favorites: 37,
    comments: [
      {
        id: 1002,
        author: '小林同学',
        authorId: 'demo-user',
        content: '这个窗口排队久吗？',
        deleted: false,
        parentId: null,
        createdAt: Date.now() - 1000 * 60 * 50
      },
      {
        id: 1003,
        author: '饭搭子阿圆',
        authorId: 'user-4',
        content: '中午会排，晚饭前更合适。',
        deleted: false,
        parentId: 1002,
        createdAt: Date.now() - 1000 * 60 * 42
      }
    ],
    createdAt: Date.now() - 1000 * 60 * 60 * 12,
    subtitle: '',
    cover: 'https://picsum.photos/seed/canteen/640/780',
    interactions: {
      views: 310,
      likedUsers: ['demo-user'],
      favoredUsers: []
    }
  }
]
