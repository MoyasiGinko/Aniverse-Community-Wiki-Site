"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  FiFileText,
  FiTrendingUp,
  FiSearch,
  FiBookmark,
  FiShare2,
  FiEye,
  FiMessageSquare,
  FiClock,
  FiExternalLink,
  FiMail,
  FiCheckCircle,
  FiStar,
  FiBookOpen,
  FiTv,
  FiMusic,
  FiFilm,
  FiX,
  FiFilter,
  FiGlobe,
} from "react-icons/fi";
import { FaGamepad } from "react-icons/fa";
import "@/src/styles/auth.css";

type CategoryType = "Animes" | "Games" | "Movies & Series" | "Musics" | "Manga & Books";

type NewsArticle = {
  id: string;
  title: string;
  excerpt: string;
  fullBody: string;
  category: CategoryType;
  subCategory: string;
  source: string;
  date: string;
  readTime: string;
  imageUrl: string;
  externalUrl?: string;
  author: string;
  commentsCount: number;
  viewsCount: number;
  likesCount: number;
};

// Dynamic Sub-Categories for each main media category
const SUB_CATEGORIES_MAP: Record<CategoryType, string[]> = {
  Animes: ["All Animes", "Seasonal Airing", "Movies & OVAs", "Studio Production", "Voice Cast"],
  Games: ["All Games", "RPG & Gacha", "Action & Fighting", "Console & PC", "Esports"],
  "Movies & Series": ["All Movies", "Live Action Adaptations", "Hollywood & International", "Streaming Releases"],
  Musics: ["All Musics", "Anime OSTs", "J-Pop & Vocaloid", "Concerts & Tours"],
  "Manga & Books": ["All Manga", "Shonen & Seinen", "Light Novels", "Webtoons & Comics"],
};

const CATEGORY_FALLBACK_IMAGES: Record<CategoryType, string> = {
  Animes: "https://cdn.myanimelist.net/images/anime/1806/126216.jpg",
  Games: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=800&auto=format&fit=crop",
  "Movies & Series": "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=800&auto=format&fit=crop",
  Musics: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=800&auto=format&fit=crop",
  "Manga & Books": "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop",
};

// Initial Seed Articles across all categories and sub-categories
const INITIAL_NEWS: NewsArticle[] = [
  // ANIMES
  {
    id: "news-anime-1",
    title: "Chainsaw Man Movie: Reze Arc Officially Confirmed with Teaser Visual",
    excerpt: "MAPPA Studio officially announces the feature film adaptation of Chainsaw Man's fan-favorite Reze Arc coming to theaters worldwide.",
    fullBody: `MAPPA Studio has officially confirmed that the highly anticipated Reze Arc of Chainsaw Man will be adapted into a full-length theatrical anime movie. 

The announcement was accompanied by a stunning teaser key visual featuring Denji and Reze against an explosive city backdrop. Production staff confirmed that key animation is being led by senior animators from Season 1, promising movie-quality fight choreography and emotional storytelling.

Release windows for global theaters are scheduled for late 2026, with Crunchyroll acquiring international distribution rights across North America, Europe, and Asia.`,
    category: "Animes",
    subCategory: "Movies & OVAs",
    source: "MAPPA Official / Aniverse Desk",
    date: "2026-07-24",
    readTime: "3 min read",
    imageUrl: "https://cdn.myanimelist.net/images/anime/1806/126216.jpg",
    externalUrl: "https://myanimelist.net/anime/56808",
    author: "Elena Rostova",
    commentsCount: 142,
    viewsCount: 4820,
    likesCount: 930,
  },
  {
    id: "news-anime-2",
    title: "Demon Slayer: Infinity Castle Arc Announced as Feature Film Trilogy",
    excerpt: "Ufotable confirms the final confrontation against Muzan Kibutsuji will be adapted as a three-part cinematic event.",
    fullBody: `Ufotable and Aniplex have shocked anime fans worldwide by announcing that the climax of Demon Slayer: Kimetsu no Yaiba — the Infinity Castle Arc — will be produced as a trilogy of feature films.

The trilogy will adapt the intense battles between the Hashira and the Upper Rank Demons inside Muzan's dimensional fortress. Ufotable promises unprecedented visual fidelity, Dolby Atmos sound design, and extended battle sequences for theatrical IMAX screens.`,
    category: "Animes",
    subCategory: "Movies & OVAs",
    source: "Ufotable Press Release",
    date: "2026-07-23",
    readTime: "4 min read",
    imageUrl: "https://cdn.myanimelist.net/images/anime/1286/99889.jpg",
    externalUrl: "https://myanimelist.net/anime/59196",
    author: "Kenji Sato",
    commentsCount: 289,
    viewsCount: 6120,
    likesCount: 1410,
  },
  {
    id: "news-anime-3",
    title: "Jujutsu Kaisen Season 3 Culling Game Arc Production Underway",
    excerpt: "Director confirms character designs and key animation benchmarks for the upcoming Culling Game arc.",
    fullBody: `MAPPA Studio has released a production progress report for Jujutsu Kaisen Season 3, detailing the preparation for the high-stakes Culling Game Arc.

Series director and lead animators revealed new character concepts for Hajime Kashimo, Hiromi Higuruma, and Yuta Okkotsu's return to Tokyo. Animation teams are utilizing advanced dynamic lighting pipelines to capture the grim urban sorcery battles.`,
    category: "Animes",
    subCategory: "Studio Production",
    source: "MAPPA Animation Studio",
    date: "2026-07-22",
    readTime: "3 min read",
    imageUrl: "https://cdn.myanimelist.net/images/anime/1171/109222.jpg",
    externalUrl: "https://myanimelist.net/anime/40748",
    author: "Marcus Vance",
    commentsCount: 112,
    viewsCount: 3410,
    likesCount: 780,
  },
  {
    id: "news-anime-4",
    title: "Solo Leveling Season 2 'Arise from the Shadow' Visual & Key Teaser",
    excerpt: "A-1 Pictures releases official trailer showcasing Sung Jinwoo's shadow monarch army in Season 2.",
    fullBody: `A-1 Pictures has unveiled a new visual and trailer for Solo Leveling Season 2: Arise from the Shadow.

The trailer features Sung Jinwoo leading Igris, Iron, and Tank into battle against high-rank S-gate dungeons. Composers Sawano Hiroyuki and TOMORROW X TOGETHER return for the main opening theme track.`,
    category: "Animes",
    subCategory: "Seasonal Airing",
    source: "Aniplex Official",
    date: "2026-07-21",
    readTime: "2 min read",
    imageUrl: "https://cdn.myanimelist.net/images/anime/1108/139265.jpg",
    externalUrl: "https://myanimelist.net/anime/58564",
    author: "Elena Rostova",
    commentsCount: 198,
    viewsCount: 4210,
    likesCount: 890,
  },

  // GAMES
  {
    id: "news-game-1",
    title: "Genshin Impact Version 5.0 Natlan Region Launch & Pyro Archon Gameplay",
    excerpt: "HoYoverse unveils the Nation of War, Natlan, introducing Saurian traversal mechanics and new 5-star character banners.",
    fullBody: `HoYoverse has officially launched Natlan, the sixth major nation in Teyvat. Known as the Land of War and Fire, Natlan introduces groundbreaking traversal gameplay allowing players to shape-shift into native Saurians to swim through lava, climb cliffs, and glide over canyons.

The special program stream also provided a first look at Mavuika, the Pyro Archon, along with new artifact domains and quality-of-life system updates.`,
    category: "Games",
    subCategory: "RPG & Gacha",
    source: "HoYoverse Official",
    date: "2026-07-24",
    readTime: "4 min read",
    imageUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=800&auto=format&fit=crop",
    externalUrl: "https://genshin.hoyoverse.com",
    author: "Alex Mercer",
    commentsCount: 195,
    viewsCount: 3940,
    likesCount: 820,
  },
  {
    id: "news-game-2",
    title: "Dragon Ball: Sparking! ZERO Adds 180+ Fighter Roster in New Reveal",
    excerpt: "Bandai Namco confirms full roster list featuring GT, Super, and Movie characters with destructible battle arenas.",
    fullBody: `Bandai Namco has revealed the complete launch roster for Dragon Ball: Sparking! ZERO, bringing the total playable character count to over 180 fighters. 

The latest trailer showcased intense combat mechanics, environmental destruction physics, and custom what-if scenario campaign modes where players can alter canonical Dragon Ball storylines.`,
    category: "Games",
    subCategory: "Action & Fighting",
    source: "Bandai Namco Games",
    date: "2026-07-23",
    readTime: "3 min read",
    imageUrl: "https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=800&auto=format&fit=crop",
    externalUrl: "https://en.bandainamcoent.eu",
    author: "Alex Mercer",
    commentsCount: 164,
    viewsCount: 3120,
    likesCount: 640,
  },
  {
    id: "news-game-3",
    title: "Persona 3 Reload: Episode Aigis DLC Released Worldwide",
    excerpt: "Atlus drops major story expansion following Aigis and the SEES squad in the Abyss of Time.",
    fullBody: `Atlus has released Episode Aigis: The Answer expansion for Persona 3 Reload. Players control Aigis as she uncovers the mystery behind the March 31st time loop inside the Abyss of Time.

The expansion includes remixed battle themes by Atsushi Kitajoh, synthesized Personas, and enhanced dungeon crawling mechanics.`,
    category: "Games",
    subCategory: "Console & PC",
    source: "Atlus West / Sega",
    date: "2026-07-21",
    readTime: "3 min read",
    imageUrl: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=800&auto=format&fit=crop",
    externalUrl: "https://persona.atlus.com",
    author: "Kenji Sato",
    commentsCount: 89,
    viewsCount: 2150,
    likesCount: 490,
  },

  // MOVIES & SERIES
  {
    id: "news-movie-1",
    title: "One Piece Live Action Season 2 Wraps Filming in South Africa",
    excerpt: "Netflix confirms Season 2 completion featuring Chopper, Smoker, and the Arabasta Saga storyline.",
    fullBody: `Netflix's hit live-action adaptation of One Piece has officially wrapped principal photography for Season 2 in Cape Town, South Africa.

Showrunners confirmed that Season 2 will cover Loguetown, Reverse Mountain, Whiskey Peak, Little Garden, and Drum Island, introducing Tony Tony Chopper, Captain Smoker, and Princess Vivi to the Straw Hat crew.`,
    category: "Movies & Series",
    subCategory: "Live Action Adaptations",
    source: "Netflix Geeked",
    date: "2026-07-24",
    readTime: "3 min read",
    imageUrl: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=800&auto=format&fit=crop",
    externalUrl: "https://www.netflix.com",
    author: "Sarah Connor",
    commentsCount: 210,
    viewsCount: 4500,
    likesCount: 990,
  },
  {
    id: "news-movie-2",
    title: "Godzilla Minus One Wins Academy Award for Best Visual Effects",
    excerpt: "Takashi Yamazaki's cinematic masterpiece becomes the first Japanese film to win Oscar for Visual Effects.",
    fullBody: `Director Takashi Yamazaki and his 35-person VFX team at Robot Communications made cinematic history by winning the Academy Award for Best Visual Effects for Godzilla Minus One.

Produced on a modest budget, the film captured global critical acclaim for its grounded emotional storytelling and groundbreaking digital monster destruction sequences.`,
    category: "Movies & Series",
    subCategory: "Hollywood & International",
    source: "Toho Pictures / Academy Awards",
    date: "2026-07-22",
    readTime: "4 min read",
    imageUrl: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=800&auto=format&fit=crop",
    externalUrl: "https://godzilla.com",
    author: "Sarah Connor",
    commentsCount: 340,
    viewsCount: 5890,
    likesCount: 1650,
  },

  // MUSICS
  {
    id: "news-music-1",
    title: "YOASOBI Announces 2026 World Tour & New Anime Opening Theme Single",
    excerpt: "J-pop duo YOASOBI announces international arena concert dates across Asia, Europe, and North America.",
    fullBody: `Acclaimed J-pop hitmaker duo YOASOBI (Ayase and ikura) have announced their largest global arena tour to date, covering 15 countries.

Alongside the tour announcement, the duo revealed a brand-new single titled 'Idol's Echo', which will serve as the main theme song for an upcoming flagship anime series this fall.`,
    category: "Musics",
    subCategory: "J-Pop & Vocaloid",
    source: "Sony Music Japan",
    date: "2026-07-24",
    readTime: "2 min read",
    imageUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=800&auto=format&fit=crop",
    externalUrl: "https://www.yoasobi-music.jp",
    author: "Reiko Takahashi",
    commentsCount: 88,
    viewsCount: 2890,
    likesCount: 710,
  },
  {
    id: "news-music-2",
    title: "Kenshi Yonezu Releases New Track 'KICK BACK' Live Concert Film",
    excerpt: "Chainsaw Man opening theme artist releases Tokyo Dome live concert performance recording.",
    fullBody: `Kenshi Yonezu has released an official live concert film recorded at Tokyo Dome during his 'LOST CORNER' Japan tour.

The performance features explosive live renditions of Chainsaw Man's 'KICK BACK', Shin Ultraman's 'M87', and his record-breaking ballad 'Lemon'.`,
    category: "Musics",
    subCategory: "Concerts & Tours",
    source: "Universal Music Japan",
    date: "2026-07-22",
    readTime: "3 min read",
    imageUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=800&auto=format&fit=crop",
    externalUrl: "https://reissuerecords.net",
    author: "Reiko Takahashi",
    commentsCount: 104,
    viewsCount: 3450,
    likesCount: 820,
  },

  // MANGA & BOOKS
  {
    id: "news-manga-1",
    title: "One Piece Manga Enters Final Climax Phase as Eiichiro Oda Breaks Records",
    excerpt: "Oda sensei drops major lore secrets surrounding the Void Century, Ancient Kingdom, and Will of D.",
    fullBody: `Eiichiro Oda's One Piece manga has entered its definitive climax phase. Recent Weekly Shonen Jump chapters have unveiled long-awaited historical revelations regarding the Void Century, Joy Boy's legacy, and the true nature of the Devil Fruits.

Shonen Jump editors reported historic sales numbers as global volume sales pass 500 million copies worldwide.`,
    category: "Manga & Books",
    subCategory: "Shonen & Seinen",
    source: "Weekly Shonen Jump",
    date: "2026-07-24",
    readTime: "5 min read",
    imageUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop",
    externalUrl: "https://shonenjump.viz.com",
    author: "Hiroshi Tanaka",
    commentsCount: 512,
    viewsCount: 8940,
    likesCount: 2100,
  },
  {
    id: "news-manga-2",
    title: "Berserk Manga Continuation Chapters Announced by Studio Gaga",
    excerpt: "Kouji Mori and Studio Gaga confirm next arc continuation based on Kentaro Miura's notes.",
    fullBody: `Studio Gaga and supervisor Kouji Mori have announced the next chapter batch for Berserk. 

The story continues Guts' journey following the destruction of Elfhelm, strictly abiding by the late Kentaro Miura's explicit outline and plot manuscripts shared before his passing.`,
    category: "Manga & Books",
    subCategory: "Shonen & Seinen",
    source: "Young Animal / Hakusensha",
    date: "2026-07-23",
    readTime: "4 min read",
    imageUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=800&auto=format&fit=crop",
    externalUrl: "https://www.hakusensha.co.jp",
    author: "Hiroshi Tanaka",
    commentsCount: 420,
    viewsCount: 7120,
    likesCount: 1890,
  },
];

export default function NewsHomepage() {
  const [newsList, setNewsList] = useState<NewsArticle[]>(INITIAL_NEWS);
  const [activeCategory, setActiveCategory] = useState<CategoryType>("Animes");
  const [activeSubCategory, setActiveSubCategory] = useState<string>("All Animes");
  const [search, setSearch] = useState("");
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);

  // In-Page Comment state for Reader Modal
  const [commentText, setCommentText] = useState("");
  const [articleComments, setArticleComments] = useState<{ id: string; author: string; text: string; date: string }[]>([]);

  // When main category changes, reset sub-category to "All ..."
  const handleMainCategoryChange = (cat: CategoryType) => {
    setActiveCategory(cat);
    const defaultSub = SUB_CATEGORIES_MAP[cat][0];
    setActiveSubCategory(defaultSub);
  };

  // Multi-Source International Open Public APIs Fetcher
  useEffect(() => {
    const fetchMultiSourcePublicNews = async () => {
      try {
        // Fetch 1: Jikan Anime API
        // Fetch 2: Jikan Manga API
        // Fetch 3: TVmaze Open Movies/TV API
        // Fetch 4: iTunes Open Music Search API
        // Multi-Source International Open Public APIs Fetcher
        const [
          animeRes,
          mangaRes,
          tvRes,
          musicAnimeRes,
          musicJpopRes,
          gamesRes,
          kitsuAnimeRes,
          openLibraryRes,
          anilistRes,
        ] = await Promise.allSettled([
          fetch("https://api.jikan.moe/v4/top/anime?limit=18"),
          fetch("https://api.jikan.moe/v4/top/manga?limit=18"),
          fetch("https://api.tvmaze.com/shows?page=1"),
          fetch("https://itunes.apple.com/search?term=anime+ost&entity=song&limit=15"),
          fetch("https://itunes.apple.com/search?term=jpop&entity=song&limit=15"),
          fetch("https://www.freetogame.com/api/games"),
          fetch("https://kitsu.io/api/edge/trending/anime"),
          fetch("https://openlibrary.org/subjects/fantasy.json?limit=15"),
          fetch("https://graphql.anilist.co", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              query: `
                query {
                  anime: Page(page: 1, perPage: 12) {
                    media(type: ANIME, sort: TRENDING_DESC) {
                      id
                      title { romaji english }
                      description
                      coverImage { extraLarge large }
                      siteUrl
                      bannerImage
                      averageScore
                    }
                  }
                  manga: Page(page: 1, perPage: 12) {
                    media(type: MANGA, sort: TRENDING_DESC) {
                      id
                      title { romaji english }
                      description
                      coverImage { extraLarge large }
                      siteUrl
                      averageScore
                    }
                  }
                }
              `,
            }),
          }),
        ]);

        const newItems: NewsArticle[] = [];

        // Parse AniList GraphQL API (Anime & Manga)
        if (anilistRes.status === "fulfilled" && anilistRes.value.ok) {
          const aniData = await anilistRes.value.json();
          const animeList = aniData?.data?.anime?.media || [];
          const mangaList = aniData?.data?.manga?.media || [];

          animeList.forEach((item: any, idx: number) => {
            const titleStr = item.title?.english || item.title?.romaji || "Global Anime";
            const desc = item.description ? item.description.replace(/<[^>]+>/g, "") : "";
            newItems.push({
              id: `anilist-anime-${item.id}`,
              title: `${titleStr} — Global AniList Trending Announcement`,
              excerpt: desc ? `${desc.slice(0, 160)}...` : "Trending anime announcement from AniList global database.",
              fullBody: desc || "Official AniList global trending anime record.",
              category: "Animes",
              subCategory: "Seasonal Airing",
              source: "AniList GraphQL API",
              date: new Date(Date.now() - idx * 28000000).toISOString().slice(0, 10),
              readTime: "3 min read",
              imageUrl: item.coverImage?.extraLarge || item.coverImage?.large || CATEGORY_FALLBACK_IMAGES.Animes,
              externalUrl: item.siteUrl,
              author: "AniList News Network",
              commentsCount: 94,
              viewsCount: item.averageScore ? item.averageScore * 45 : 3200,
              likesCount: item.averageScore ? item.averageScore * 12 : 780,
            });
          });

          mangaList.forEach((item: any, idx: number) => {
            const titleStr = item.title?.english || item.title?.romaji || "Global Manga";
            const desc = item.description ? item.description.replace(/<[^>]+>/g, "") : "";
            newItems.push({
              id: `anilist-manga-${item.id}`,
              title: `${titleStr} — Worldwide Manga Release & Review`,
              excerpt: desc ? `${desc.slice(0, 160)}...` : "Worldwide manga publishing update from AniList.",
              fullBody: desc || "Official AniList global manga entry.",
              category: "Manga & Books",
              subCategory: "Shonen & Seinen",
              source: "AniList Manga API",
              date: new Date(Date.now() - idx * 29000000).toISOString().slice(0, 10),
              readTime: "4 min read",
              imageUrl: item.coverImage?.extraLarge || item.coverImage?.large || CATEGORY_FALLBACK_IMAGES["Manga & Books"],
              externalUrl: item.siteUrl,
              author: "AniList Manga Desk",
              commentsCount: 81,
              viewsCount: item.averageScore ? item.averageScore * 40 : 2800,
              likesCount: item.averageScore ? item.averageScore * 10 : 640,
            });
          });
        }

        // Parse Anime (Jikan MAL API)
        if (animeRes.status === "fulfilled" && animeRes.value.ok) {
          const data = await animeRes.value.json();
          if (data.data && Array.isArray(data.data)) {
            data.data.forEach((anime: any, idx: number) => {
              newItems.push({
                id: `jikan-anime-${anime.mal_id}`,
                title: `${anime.title} — Global Season Release & Studio Update`,
                excerpt: anime.synopsis
                  ? `${anime.synopsis.slice(0, 160)}...`
                  : "Latest anime news and production updates from studio producers.",
                fullBody: anime.synopsis || "Official anime news release from studio producers.",
                category: "Animes",
                subCategory: idx % 2 === 0 ? "Seasonal Airing" : "Studio Production",
                source: "MyAnimeList International API",
                date: new Date(Date.now() - idx * 43200000).toISOString().slice(0, 10),
                readTime: "3 min read",
                imageUrl: anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url || CATEGORY_FALLBACK_IMAGES.Animes,
                externalUrl: anime.url,
                author: "Jikan News Desk",
                commentsCount: anime.members ? Math.floor(anime.members / 1000) : 45,
                viewsCount: anime.score ? Math.floor(anime.score * 1200) : 1500,
                likesCount: anime.favorites ? Math.floor(anime.favorites / 10) : 320,
              });
            });
          }
        }

        // Parse Kitsu Trending Anime API
        if (kitsuAnimeRes.status === "fulfilled" && kitsuAnimeRes.value.ok) {
          const kitsuData = await kitsuAnimeRes.value.json();
          if (kitsuData.data && Array.isArray(kitsuData.data)) {
            kitsuData.data.forEach((item: any, idx: number) => {
              const attr = item.attributes || {};
              newItems.push({
                id: `kitsu-anime-${item.id}`,
                title: `${attr.canonicalTitle || attr.titles?.en || "Global Anime"} — International Broadcast`,
                excerpt: attr.synopsis
                  ? `${attr.synopsis.slice(0, 160)}...`
                  : "Trending international anime news release.",
                fullBody: attr.synopsis || "Official anime broadcast news release.",
                category: "Animes",
                subCategory: "Movies & OVAs",
                source: "Kitsu Global Anime API",
                date: new Date(Date.now() - (idx + 1) * 36000000).toISOString().slice(0, 10),
                readTime: "4 min read",
                imageUrl: attr.posterImage?.large || attr.posterImage?.original || CATEGORY_FALLBACK_IMAGES.Animes,
                externalUrl: `https://kitsu.io/anime/${item.id}`,
                author: "Kitsu Global Desk",
                commentsCount: 78,
                viewsCount: 2900,
                likesCount: 510,
              });
            });
          }
        }

        // Parse Manga (Jikan MAL Manga API)
        if (mangaRes.status === "fulfilled" && mangaRes.value.ok) {
          const data = await mangaRes.value.json();
          if (data.data && Array.isArray(data.data)) {
            data.data.forEach((manga: any, idx: number) => {
              newItems.push({
                id: `jikan-manga-${manga.mal_id}`,
                title: `${manga.title} — Manga Chapter & Volume Milestone`,
                excerpt: manga.synopsis
                  ? `${manga.synopsis.slice(0, 160)}...`
                  : "Latest manga release updates and publishing announcements.",
                fullBody: manga.synopsis || "Official manga release announcements from publisher editors.",
                category: "Manga & Books",
                subCategory: idx % 2 === 0 ? "Shonen & Seinen" : "Light Novels",
                source: "MyAnimeList Manga API",
                date: new Date(Date.now() - idx * 43200000).toISOString().slice(0, 10),
                readTime: "4 min read",
                imageUrl: manga.images?.jpg?.large_image_url || manga.images?.jpg?.image_url || CATEGORY_FALLBACK_IMAGES["Manga & Books"],
                externalUrl: manga.url,
                author: "Shonen Manga Desk",
                commentsCount: manga.members ? Math.floor(manga.members / 1000) : 52,
                viewsCount: manga.score ? Math.floor(manga.score * 1100) : 1800,
                likesCount: manga.favorites ? Math.floor(manga.favorites / 10) : 410,
              });
            });
          }
        }

        // Parse Open Library Books API
        if (openLibraryRes.status === "fulfilled" && openLibraryRes.value.ok) {
          const libData = await openLibraryRes.value.json();
          if (libData.works && Array.isArray(libData.works)) {
            libData.works.forEach((work: any, idx: number) => {
              const coverId = work.cover_id;
              const imgUrl = coverId
                ? `https://covers.openlibrary.org/b/id/${coverId}-L.jpg`
                : CATEGORY_FALLBACK_IMAGES["Manga & Books"];
              newItems.push({
                id: `openlib-${work.key.replace(/\//g, "-")}`,
                title: `${work.title} — International Fantasy & Fiction Edition`,
                excerpt: `Global book feature: ${work.title} written by ${work.authors?.[0]?.name || "Renowned Authors"}.`,
                fullBody: `International literary spotlight on "${work.title}". Available across worldwide publishing distribution networks.`,
                category: "Manga & Books",
                subCategory: "Webtoons & Comics",
                source: "Open Library Global API",
                date: new Date(Date.now() - idx * 50000000).toISOString().slice(0, 10),
                readTime: "5 min read",
                imageUrl: imgUrl,
                externalUrl: `https://openlibrary.org${work.key}`,
                author: "Global Literary Wire",
                commentsCount: 42,
                viewsCount: 1980,
                likesCount: 360,
              });
            });
          }
        }

        // Parse TV / Movies (TVmaze Open API)
        if (tvRes.status === "fulfilled" && tvRes.value.ok) {
          const shows = await tvRes.value.json();
          if (Array.isArray(shows)) {
            shows.slice(0, 18).forEach((show: any, idx: number) => {
              newItems.push({
                id: `tvmaze-${show.id}`,
                title: `${show.name} — Live Action Series & Adaptation Update`,
                excerpt: show.summary
                  ? `${show.summary.replace(/<[^>]+>/g, "").slice(0, 160)}...`
                  : "Latest live action movie and television series production news.",
                fullBody: show.summary ? show.summary.replace(/<[^>]+>/g, "") : "Official live action television and cinema news.",
                category: "Movies & Series",
                subCategory: idx % 2 === 0 ? "Streaming Releases" : "Hollywood & International",
                source: "TVmaze Open International API",
                date: new Date(Date.now() - idx * 36000000).toISOString().slice(0, 10),
                readTime: "3 min read",
                imageUrl: show.image?.original || show.image?.medium || CATEGORY_FALLBACK_IMAGES["Movies & Series"],
                externalUrl: show.url,
                author: "TV Cinema Wire",
                commentsCount: 95,
                viewsCount: 3100,
                likesCount: 540,
              });
            });
          }
        }

        // Parse iTunes Anime Music & J-Pop
        const processMusicRes = async (res: any, subCat: string) => {
          if (res.status === "fulfilled" && res.value.ok) {
            const musicData = await res.value.json();
            if (musicData.results && Array.isArray(musicData.results)) {
              musicData.results.forEach((song: any, idx: number) => {
                newItems.push({
                  id: `itunes-${song.trackId}`,
                  title: `${song.trackName} by ${song.artistName} — Worldwide Music Launch`,
                  excerpt: `New track "${song.trackName}" from collection "${song.collectionName}" released worldwide.`,
                  fullBody: `Official release of "${song.trackName}" by ${song.artistName} available on global streaming platforms.`,
                  category: "Musics",
                  subCategory: subCat,
                  source: "iTunes Global Music API",
                  date: new Date(Date.now() - idx * 40000000).toISOString().slice(0, 10),
                  readTime: "2 min read",
                  imageUrl: song.artworkUrl100 ? song.artworkUrl100.replace("100x100bb", "600x600bb") : CATEGORY_FALLBACK_IMAGES.Musics,
                  externalUrl: song.trackViewUrl,
                  author: "J-Pop Music Press",
                  commentsCount: 64,
                  viewsCount: 2190,
                  likesCount: 480,
                });
              });
            }
          }
        };

        await processMusicRes(musicAnimeRes, "Anime OSTs");
        await processMusicRes(musicJpopRes, "J-Pop & Vocaloid");

        // Parse FreeToGame (Games Open API)
        if (gamesRes.status === "fulfilled" && gamesRes.value.ok) {
          const gamesData = await gamesRes.value.json();
          if (Array.isArray(gamesData)) {
            gamesData.slice(0, 18).forEach((game: any, idx: number) => {
              newItems.push({
                id: `freetogame-${game.id}`,
                title: `${game.title} — Official Gameplay & Global Expansion Update`,
                excerpt: game.short_description
                  ? `${game.short_description.slice(0, 160)}...`
                  : "Latest video game expansion, event update, and patch notes.",
                fullBody: game.short_description || "Official video game update release notes.",
                category: "Games",
                subCategory: game.genre || "RPG & Gacha",
                source: "FreeToGame Global API",
                date: new Date(Date.now() - idx * 36000000).toISOString().slice(0, 10),
                readTime: "3 min read",
                imageUrl: game.thumbnail || CATEGORY_FALLBACK_IMAGES.Games,
                externalUrl: game.freetogame_profile_url || game.game_url,
                author: "Gaming Central Desk",
                commentsCount: 88,
                viewsCount: 3400,
                likesCount: 690,
              });
            });
          }
        }

        if (newItems.length) {
          setNewsList((prev) => {
            const existingIds = new Set(prev.map((n) => n.id));
            const uniqueFetched = newItems.filter((f) => !existingIds.has(f.id));
            return [...prev, ...uniqueFetched];
          });
        }
      } catch {
        // Fallback
      }
    };

    fetchMultiSourcePublicNews();
  }, []);

  const toggleBookmark = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setBookmarkedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !selectedArticle) return;

    const newComment = {
      id: `comment-${Date.now()}`,
      author: "You (Otaku Member)",
      text: commentText,
      date: "Just now",
    };

    setArticleComments((prev) => [newComment, ...prev]);
    setCommentText("");
  };

  const categoryTabs: { id: CategoryType; label: string; icon: React.ReactNode }[] = [
    { id: "Animes", label: "Animes", icon: <FiFilm /> },
    { id: "Games", label: "Games", icon: <FaGamepad /> },
    { id: "Movies & Series", label: "Movies & Series", icon: <FiTv /> },
    { id: "Musics", label: "Musics", icon: <FiMusic /> },
    { id: "Manga & Books", label: "Manga & Books", icon: <FiBookOpen /> },
  ];

  // Active Sub-Categories for current Main Category
  const activeSubCategories = SUB_CATEGORIES_MAP[activeCategory];

  // Filter Articles by Main Category, Sub-Category, and Search
  const filteredNews = newsList.filter((item) => {
    const passesCategory = item.category === activeCategory;
    const passesSub =
      activeSubCategory.startsWith("All") ||
      item.subCategory.toLowerCase() === activeSubCategory.toLowerCase() ||
      item.category.toLowerCase().includes(activeSubCategory.toLowerCase());
    const passesSearch =
      item.title.toLowerCase().includes(search.trim().toLowerCase()) ||
      item.excerpt.toLowerCase().includes(search.trim().toLowerCase());
    return passesCategory && passesSub && passesSearch;
  });

  // Top Trending Articles for the ACTIVE Category
  const categoryTrendingNews = newsList
    .filter((item) => item.category === activeCategory)
    .sort((a, b) => b.viewsCount - a.viewsCount)
    .slice(0, 5);

  return (
    <main className="feature-page relative overflow-hidden">
      <div className="bg-glow-1"></div>
      <div className="bg-glow-2"></div>

      {/* Hero Workspace Banner */}
      <section className="workspace-hero-banner relative z-10">
        <div className="hero-banner-content">
          <div className="auth-badge">
            <span>⚡ Worldwide Multi-API Media News</span>
          </div>
          <h1 className="hero-banner-title">
            Aniverse <span style={{ color: "var(--brand)" }}>International News</span> Hub
          </h1>
          <p className="hero-banner-desc">
            Multi-source global coverage across Animes, Gaming, Movies, J-Pop Musics, and Manga publications.
          </p>
        </div>

        <div className="hero-banner-mascot-wrapper">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/peeking_ai_robot.png"
            alt="Aniverse AI News Assistant"
            className="hero-banner-mascot-img"
          />
        </div>
      </section>

      {/* Top Main Category Switcher Tabs */}
      <section className="section-block relative z-10" style={{ marginBottom: "1.5rem" }}>
        <div className="settings-card">
          <div className="badge-pill-list" style={{ gap: "0.75rem", justifyContent: "flex-start" }}>
            {categoryTabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                className={activeCategory === tab.id ? "workspace-link-nested active" : "workspace-link-nested"}
                onClick={() => handleMainCategoryChange(tab.id)}
                style={{ padding: "0.65rem 1.25rem", fontSize: "0.95rem", display: "flex", alignItems: "center", gap: "0.5rem" }}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 2-COLUMN PORTAL LAYOUT */}
      <section className="workspace-layout relative z-10">
        {/* LEFT COLUMN: Sub-Categories Sidebar */}
        <aside className="workspace-sidebar section-block">
          <h3>
            <FiFilter style={{ color: "var(--brand)" }} /> {activeCategory} Sub-Categories
          </h3>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", marginTop: "0.75rem" }}>
            {activeSubCategories.map((sub) => (
              <button
                key={sub}
                type="button"
                className={activeSubCategory === sub ? "workspace-link active" : "workspace-link"}
                onClick={() => setActiveSubCategory(sub)}
              >
                <span style={{ fontSize: "0.88rem", fontWeight: 700 }}>{sub}</span>
              </button>
            ))}
          </div>

          <div className="security-banner" style={{ marginTop: "1.5rem" }}>
            <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--brand)" }}>
              <FiGlobe style={{ marginRight: "4px" }} /> Open API Feeds:
            </span>
            <p className="settings-input-helper" style={{ margin: "0.25rem 0 0", fontSize: "0.78rem" }}>
              Jikan MAL, TVmaze Cinema, FreeToGame, & iTunes Open Store.
            </p>
          </div>
        </aside>

        {/* MAIN CONTENT: Search, Trending Strip, & Article Feed */}
        <div className="workspace-content">
          {/* Search Bar */}
          <div className="settings-card" style={{ marginBottom: "1.25rem" }}>
            <div className="settings-field-group" style={{ position: "relative" }}>
              <input
                className="settings-input"
                style={{ paddingLeft: "2.5rem" }}
                placeholder={`Search ${activeCategory} (${activeSubCategory}) stories...`}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <FiSearch style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "var(--muted)" }} />
            </div>
          </div>

          {/* TOP TRENDING POSTS BELOW SEARCH */}
          <div className="settings-card" style={{ marginBottom: "1.25rem" }}>
            <h3 style={{ fontSize: "0.95rem", fontWeight: 800, marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <FiTrendingUp style={{ color: "var(--brand)" }} /> Top Trending in {activeCategory}
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.45rem" }}>
              {categoryTrendingNews.map((item, idx) => (
                <div
                  key={item.id}
                  className="session-item-row"
                  style={{ gap: "0.6rem", alignItems: "center", cursor: "pointer", padding: "0.6rem 0.8rem", borderRadius: "12px", background: "var(--surface-soft)" }}
                  onClick={() => {
                    setSelectedArticle(item);
                    setArticleComments([]);
                  }}
                >
                  <span style={{ fontSize: "1.1rem", fontWeight: 900, color: "var(--brand)", minWidth: "24px" }}>
                    0{idx + 1}
                  </span>
                  <div style={{ minWidth: 0, overflow: "hidden" }}>
                    <strong style={{ 
                      fontSize: "0.82rem", 
                      color: "var(--text)", 
                      lineHeight: 1.2, 
                      display: "block",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis"
                    }}>
                      {item.title}
                    </strong>
                    <span className="settings-input-helper" style={{ fontSize: "0.74rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", display: "block" }}>
                      <FiEye style={{ marginRight: "3px" }} /> {item.viewsCount} views
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="settings-header-block" style={{ marginBottom: "1rem" }}>
            <div className="settings-header-info">
              <h2>{activeCategory} — {activeSubCategory} ({filteredNews.length})</h2>
              <p>Click any story card to open the complete in-page article reader.</p>
            </div>
          </div>

          {/* Article Cards Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1.25rem", alignItems: "stretch" }}>
            {filteredNews.map((article) => (
              <article
                key={article.id}
                className="settings-card fade-in-up"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  cursor: "pointer",
                  transition: "transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease",
                  padding: "1.1rem",
                  borderRadius: "18px",
                }}
                onClick={() => {
                  setSelectedArticle(article);
                  setArticleComments([]);
                }}
              >
                <div>
                  {/* Image Container with Fixed Height & Dark Glassmorphic Badge */}
                  <div
                    style={{
                      width: "100%",
                      height: "175px",
                      borderRadius: "14px",
                      overflow: "hidden",
                      marginBottom: "1rem",
                      position: "relative",
                      background: "var(--surface-soft)",
                      flexShrink: 0,
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={article.imageUrl || CATEGORY_FALLBACK_IMAGES[article.category]}
                      alt={article.title}
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = CATEGORY_FALLBACK_IMAGES[article.category] || CATEGORY_FALLBACK_IMAGES.Animes;
                      }}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        display: "block",
                      }}
                    />
                    <span
                      style={{
                        position: "absolute",
                        top: "0.6rem",
                        left: "0.6rem",
                        fontSize: "0.72rem",
                        fontWeight: 800,
                        padding: "0.3rem 0.65rem",
                        borderRadius: "8px",
                        background: "rgba(15, 23, 42, 0.85)",
                        backdropFilter: "blur(12px)",
                        WebkitBackdropFilter: "blur(12px)",
                        color: "var(--brand)",
                        border: "1px solid rgba(240, 106, 17, 0.3)",
                        letterSpacing: "0.02em",
                        zIndex: 2,
                      }}
                    >
                      {article.subCategory || article.category}
                    </span>
                    <span
                      style={{
                        position: "absolute",
                        top: "0.6rem",
                        right: "0.6rem",
                        fontSize: "0.68rem",
                        fontWeight: 700,
                        padding: "0.25rem 0.55rem",
                        borderRadius: "8px",
                        background: "rgba(0, 0, 0, 0.8)",
                        backdropFilter: "blur(10px)",
                        WebkitBackdropFilter: "blur(10px)",
                        color: "#fff",
                        border: "1px solid rgba(255, 255, 255, 0.2)",
                        zIndex: 2,
                      }}
                    >
                      {article.source.split(" ")[0]}
                    </span>
                  </div>

                  {/* Title (2-Line Clamp with min-height for symmetry) */}
                  <h3
                    style={{
                      fontSize: "1.05rem",
                      fontWeight: 800,
                      color: "var(--text)",
                      lineHeight: 1.35,
                      marginBottom: "0.5rem",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                      minHeight: "2.7em",
                    }}
                  >
                    {article.title}
                  </h3>

                  {/* Excerpt (2-Line Clamp with min-height for symmetry) */}
                  <p
                    className="settings-input-helper"
                    style={{
                      lineHeight: 1.45,
                      marginBottom: "1rem",
                      fontSize: "0.84rem",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                      minHeight: "2.6em",
                    }}
                  >
                    {article.excerpt}
                  </p>
                </div>

                {/* Footer Action Bar */}
                <div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      paddingTop: "0.75rem",
                      borderTop: "1px solid var(--border)",
                      marginTop: "0.5rem",
                    }}
                  >
                    <span
                      className="settings-input-helper"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.35rem",
                        fontSize: "0.78rem",
                        whiteSpace: "nowrap",
                      }}
                    >
                      <FiClock style={{ color: "var(--brand)" }} /> {article.date}
                    </span>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <button
                        type="button"
                        className="action-button ghost small"
                        onClick={(e) => toggleBookmark(article.id, e)}
                        aria-label="Bookmark article"
                        style={{ padding: "0.4rem 0.6rem" }}
                      >
                        <FiBookmark style={{ color: bookmarkedIds.includes(article.id) ? "var(--brand)" : "inherit" }} />
                      </button>
                      <button type="button" className="action-button small" style={{ padding: "0.4rem 0.85rem", fontSize: "0.82rem" }}>
                        Read Story
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {!filteredNews.length ? (
            <div className="settings-card">
              <p className="settings-input-helper">No news articles found for &quot;{search}&quot; under {activeSubCategory}.</p>
            </div>
          ) : null}
        </div>
      </section>

      {/* In-Page Article Reader Modal */}
      {selectedArticle ? (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
            background: "rgba(0, 0, 0, 0.72)",
            backdropFilter: "blur(14px)",
            WebkitBackdropFilter: "blur(14px)",
            animation: "fadeIn 0.2s ease-out",
          }}
          onClick={() => setSelectedArticle(null)}
        >
          <div
            className="settings-card fade-in-up"
            style={{
              width: "100%",
              maxWidth: "760px",
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: "24px",
              boxShadow: "0 25px 60px rgba(0, 0, 0, 0.6)",
              padding: "2rem",
              maxHeight: "90vh",
              overflowY: "auto",
              position: "relative",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header Controls */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <span className="auth-badge">
                <FiFileText style={{ marginRight: "4px" }} /> {selectedArticle.category} Article Reader
              </span>
              <button
                type="button"
                className="action-button ghost small"
                onClick={() => setSelectedArticle(null)}
                style={{ borderRadius: "50%", padding: "0.4rem", minWidth: "32px" }}
              >
                <FiX />
              </button>
            </div>

            {/* Cover Image */}
            <div style={{ width: "100%", height: "260px", borderRadius: "18px", overflow: "hidden", marginBottom: "1.25rem" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={selectedArticle.imageUrl} alt={selectedArticle.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>

            {/* Article Title & Metadata */}
            <h1 style={{ fontSize: "1.5rem", fontWeight: 900, color: "var(--text)", lineHeight: 1.3, marginBottom: "0.75rem" }}>
              {selectedArticle.title}
            </h1>

            <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.25rem", flexWrap: "wrap" }}>
              <span className="settings-input-helper">By <strong>{selectedArticle.author}</strong></span>
              <span className="settings-input-helper">Published: {selectedArticle.date}</span>
              <span className="settings-input-helper"><FiClock style={{ marginRight: "3px" }} /> {selectedArticle.readTime}</span>
              <span className="settings-input-helper">Source: {selectedArticle.source}</span>
            </div>

            {/* Article Action Bar */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.75rem 0", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)", marginBottom: "1.25rem", flexWrap: "wrap" }}>
              {selectedArticle.externalUrl ? (
                <a
                  href={selectedArticle.externalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="action-button ghost small"
                >
                  <FiExternalLink style={{ marginRight: "4px" }} /> Open Original Source Link
                </a>
              ) : null}

              <button
                type="button"
                className="action-button ghost small"
                onClick={() => toggleBookmark(selectedArticle.id)}
              >
                <FiBookmark style={{ marginRight: "4px", color: bookmarkedIds.includes(selectedArticle.id) ? "var(--brand)" : "inherit" }} />
                {bookmarkedIds.includes(selectedArticle.id) ? "Saved" : "Save Article"}
              </button>
            </div>

            {/* Full Article Content */}
            <article style={{ fontSize: "1rem", color: "var(--text)", lineHeight: 1.8, whiteSpace: "pre-wrap", marginBottom: "2rem" }}>
              {selectedArticle.fullBody}
            </article>

            {/* In-Page Member Discussion Section */}
            <section style={{ paddingTop: "1.5rem", borderTop: "1px solid var(--border)" }}>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 800, marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <FiMessageSquare style={{ color: "var(--brand)" }} /> Discussion Comments
              </h3>

              <form onSubmit={handleAddComment} style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginBottom: "1rem" }}>
                <textarea
                  className="settings-textarea"
                  rows={2}
                  placeholder="Share your thoughts on this story..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                />
                <button type="submit" className="action-button small" style={{ alignSelf: "flex-end" }} disabled={!commentText.trim()}>
                  Post Comment
                </button>
              </form>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {articleComments.map((c) => (
                  <div key={c.id} className="session-item-row" style={{ flexDirection: "column", alignItems: "flex-start", gap: "0.25rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
                      <strong style={{ fontSize: "0.85rem", color: "var(--brand)" }}>{c.author}</strong>
                      <span className="settings-input-helper" style={{ fontSize: "0.75rem" }}>{c.date}</span>
                    </div>
                    <p style={{ margin: 0, fontSize: "0.9rem", color: "var(--text)" }}>{c.text}</p>
                  </div>
                ))}

                {!articleComments.length ? (
                  <p className="settings-input-helper">No comments posted yet. Be the first to join the conversation!</p>
                ) : null}
              </div>
            </section>
          </div>
        </div>
      ) : null}
    </main>
  );
}
