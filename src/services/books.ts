// Google Books API
// Documentation: https://developers.google.com/books/docs/v1/using

const BASE_URL = "https://www.googleapis.com/books/v1/volumes";

export async function getTrendingBooks(startIndex = 0) {
  // Simulating trending by querying for 2024 or bestsellers subject
  const res = await fetch(`${BASE_URL}?q=subject:fiction&orderBy=newest&startIndex=${startIndex}&maxResults=12`, { next: { revalidate: 3600 } });
  if (!res.ok) return { items: [] };
  return res.json();
}

export async function getPopularBooks(startIndex = 0) {
  const res = await fetch(`${BASE_URL}?q=subject:fantasy+OR+subject:science&orderBy=relevance&startIndex=${startIndex}&maxResults=12`, { next: { revalidate: 3600 } });
  if (!res.ok) return { items: [] };
  return res.json();
}

export async function getBookDetails(id: string) {
  const res = await fetch(`${BASE_URL}/${id}`, { next: { revalidate: 86400 } });
  if (!res.ok) return null;
  return res.json();
}

export async function searchBooks(query: string, startIndex = 0) {
  const res = await fetch(`${BASE_URL}?q=${encodeURIComponent(query)}&startIndex=${startIndex}&maxResults=20`, { cache: 'no-store' });
  if (!res.ok) return { items: [], totalItems: 0 };
  return res.json();
}
