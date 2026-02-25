import { create } from 'zustand';
import { GeneratedImage } from '@/types/image';
import { GeneratedVideo } from '@/types/video';

interface GalleryState {
  // 图像库
  images: GeneratedImage[];
  // 视频库
  videos: GeneratedVideo[];
  // 收藏
  favorites: string[];
  // 操作
  addImage: (image: GeneratedImage) => void;
  addImages: (images: GeneratedImage[]) => void;
  addVideo: (video: GeneratedVideo) => void;
  addVideos: (videos: GeneratedVideo[]) => void;
  removeImage: (id: string) => void;
  removeVideo: (id: string) => void;
  toggleFavorite: (id: string) => void;
  clearAll: () => void;
  // 查询
  getFavorites: () => (GeneratedImage | GeneratedVideo)[];
  getRecentImages: (limit?: number) => GeneratedImage[];
  getRecentVideos: (limit?: number) => GeneratedVideo[];
}

export const useGalleryStore = create<GalleryState>((set, get) => ({
  images: [],
  videos: [],
  favorites: [],

  addImage: (image) =>
    set((state) => ({
      images: [image, ...state.images],
    })),

  addImages: (images) =>
    set((state) => ({
      images: [...images, ...state.images],
    })),

  addVideo: (video) =>
    set((state) => ({
      videos: [video, ...state.videos],
    })),

  addVideos: (videos) =>
    set((state) => ({
      videos: [...videos, ...state.videos],
    })),

  removeImage: (id) =>
    set((state) => ({
      images: state.images.filter((img) => img.id !== id),
      favorites: state.favorites.filter((fid) => fid !== id),
    })),

  removeVideo: (id) =>
    set((state) => ({
      videos: state.videos.filter((vid) => vid.id !== id),
      favorites: state.favorites.filter((fid) => fid !== id),
    })),

  toggleFavorite: (id) =>
    set((state) => ({
      favorites: state.favorites.includes(id)
        ? state.favorites.filter((fid) => fid !== id)
        : [...state.favorites, id],
    })),

  clearAll: () =>
    set({
      images: [],
      videos: [],
      favorites: [],
    }),

  getFavorites: () => {
    const { images, videos, favorites } = get();
    const favoriteImages = images.filter((img) => favorites.includes(img.id));
    const favoriteVideos = videos.filter((vid) => favorites.includes(vid.id));
    return [...favoriteImages, ...favoriteVideos];
  },

  getRecentImages: (limit = 10) => {
    const { images } = get();
    return images.slice(0, limit);
  },

  getRecentVideos: (limit = 10) => {
    const { videos } = get();
    return videos.slice(0, limit);
  },
}));
