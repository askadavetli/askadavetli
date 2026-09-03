export type YoutubeSearchResult = {
  videoId: string;
  title: string;
  channelTitle: string;
  thumbnailUrl: string;
};

export async function searchYoutubeMusic(
  query: string
): Promise<YoutubeSearchResult[]> {
  const apiKey = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;

  if (!apiKey) {
    throw new Error(
      "YouTube müzik araması şu an kullanılamıyor (API anahtarı eksik)."
    );
  }

  const url = new URL("https://www.googleapis.com/youtube/v3/search");
  url.searchParams.set("part", "snippet");
  url.searchParams.set("type", "video");
  url.searchParams.set("videoCategoryId", "10");
  url.searchParams.set("maxResults", "8");
  url.searchParams.set("q", query);
  url.searchParams.set("key", apiKey);

  const res = await fetch(url.toString());

  if (!res.ok) {
    throw new Error("YouTube araması başarısız oldu.");
  }

  const data = await res.json();

  type YoutubeApiItem = {
    id: { videoId: string };
    snippet: {
      title: string;
      channelTitle: string;
      thumbnails?: { default?: { url: string } };
    };
  };

  return ((data.items ?? []) as YoutubeApiItem[]).map((item) => ({
    videoId: item.id.videoId,
    title: item.snippet.title,
    channelTitle: item.snippet.channelTitle,
    thumbnailUrl: item.snippet.thumbnails?.default?.url ?? "",
  }));
}
