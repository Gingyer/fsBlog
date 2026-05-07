import Link from "next/link";
import { PostType } from "../../types";

async function fetchBlogById(id: string): Promise<PostType | null> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const res = await fetch(`${baseUrl}/api/blog/${id}`, { cache: "no-store" });
  const data = await res.json();
  return data.posts ?? null;
}

export default async function BlogDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const post = await fetchBlogById(id);

  if (!post) {
    return (
      <main className="w-full h-full">
        <div className="md:w-2/4 sm:w-3/4 m-auto p-4 my-5 rounded-lg bg-blue-900 drop-shadow-xl">
          <h1 className="text-slate-200 text-center text-2xl font-extrabold">
            Pre-Practicum Preparation Blog
          </h1>
        </div>
        <div className="w-full flex flex-col justify-center items-center">
          <div className="w-3/4 p-4 rounded-md mx-3 my-2 bg-slate-500 flex flex-col justify-center">
            <p className="text-slate-50">記事が見つかりませんでした。</p>
            <div className="mt-4">
              <Link href="/" className="px-4 py-1 text-center bg-slate-900 rounded-md font-semibold text-slate-200">
                全記事一覧に戻る
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="w-full h-full">
      <div className="md:w-2/4 sm:w-3/4 m-auto p-4 my-5 rounded-lg bg-blue-900 drop-shadow-xl">
        <h1 className="text-slate-200 text-center text-2xl font-extrabold">
          Pre-Practicum Preparation Blog
        </h1>
      </div>

      <div className="w-full flex flex-col justify-center items-center">
        <div className="w-3/4 p-4 rounded-md mx-3 my-2 bg-slate-500 flex flex-col justify-center">
          <div className="flex items-center my-3">
            <h2 className="mr-auto font-semibold text-slate-50 text-xl">{post.title}</h2>
            <Link
              href={`/blog/edit/${post.id}`}
              className="px-4 py-1 text-center text-xl bg-slate-900 rounded-md font-semibold text-slate-200"
            >
              編集
            </Link>
          </div>

          <div className="mr-auto my-1">
            <blockquote className="font-bold text-slate-50">
              {new Date(post.date).toDateString()}
            </blockquote>
          </div>

          <p className="text-slate-200 whitespace-pre-wrap mt-4">{post.description}</p>

          <div className="mt-6">
            <Link
              href="/"
              className="px-4 py-1 text-center bg-slate-900 rounded-md font-semibold text-slate-200"
            >
              全記事一覧に戻る
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
