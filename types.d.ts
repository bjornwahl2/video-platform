export type Video = {
  id: string
  title: string
  timestamp: string
  duration: string
  thumbnail: string
  videoUrl: string
};
declare module 'fluent-ffmpeg' {
  import ffmpeg = require('fluent-ffmpeg');
  export = ffmpeg;
}