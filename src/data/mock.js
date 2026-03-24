export const availableTags = ['学习', '社团', '探店', '运动', '穿搭', '摄影']

export const defaultTopics = [
  { id: 1, name: '#春日校园穿搭', participants: 276, notes: 1120, heat: 98 },
  { id: 2, name: '#期末自习室打卡', participants: 421, notes: 2048, heat: 96 },
  { id: 3, name: '#食堂新品实测', participants: 188, notes: 689, heat: 89 }
]

export const defaultNotes = [
  {
    id: 101,
    title: '图书馆四楼超安静，复习效率拉满',
    content: '靠窗位置下午阳光很舒服，推荐带耳机。',
    author: '小林同学',
    type: 'image',
    media: ['https://picsum.photos/seed/library/640/360'],
    tags: ['学习'],
    topicId: 2,
    likes: 118,
    favorites: 43,
    comments: [
      { id: 1, author: '阿奇', content: '确实！晚上人也不多～', deleted: false }
    ],
    createdAt: Date.now() - 1000 * 60 * 30,
    interactions: { views: 250, likedUsers: [], favoredUsers: [] }
  },
  {
    id: 102,
    title: '15秒操场夜跑vlog',
    content: '今天 5km 完成，配速 5:40。',
    author: '跑步喵',
    type: 'video',
    media: ['https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4'],
    subtitle: '坚持打卡第12天',
    tags: ['运动'],
    topicId: 1,
    likes: 186,
    favorites: 60,
    comments: [],
    createdAt: Date.now() - 1000 * 60 * 60 * 5,
    interactions: { views: 460, likedUsers: [], favoredUsers: [] }
  }
]
