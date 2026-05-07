import Link from "next/link";
import { PostType } from "./types";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function fetchAllBlogs(search: string = "") {
  try {
    await prisma.$connect();
    const posts = await prisma.post.findMany({
      where: {
        published: true,
        ...(search && {
          title: { contains: search, mode: "insensitive" },
        }),
      },
    });
    return posts;
  } catch (err) {
    console.error("DB取得エラー:", err);
    return [];
  } finally {
    await prisma.$disconnect();
  }
}


export default async function Home({ searchParams }: { searchParams: Promise<{ search?: string }> }) {
  const { search = "" } = await searchParams;
  const posts = await fetchAllBlogs(search);


  return (
    <main className="w-full h-full">
      <div className="md:w-2/4 sm:w-3/4 m-auto p-4 my-5 rounded-lg bg-blue-900 drop-shadow-xl">
        <h1 className="text-slate-200 text-center text-2xl font-extrabold">
         Pre-Practicum Preparation Blog
        </h1>
      </div>

      <div className="flex my-5">
        <Link
          href={"/blog/add"}
          className=" md:w-1/6 sm:w-2/4 text-center rounded-md p-2 m-auto bg-slate-300 font-semibold"
        >
          ブログ新規作成
        </Link>
      </div>


      <form method="GET" className="mx-auto my-3 flex w-3/4 max-w-2xl justify-center rounded-md bg-slate-500 p-2 shadow-lg">
        <input
          type="text"
          name="search"
          defaultValue={search}
          placeholder="タイトルで検索..."
          className="min-w-0 flex-1 rounded-l-md border border-slate-400 bg-slate-200 p-2 text-slate-900 placeholder:text-slate-600 focus:bg-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-300"
        />
        <button
          type="submit"
          className="rounded-r-md bg-slate-900 px-4 py-2 font-semibold text-slate-100 hover:bg-slate-800"
        >
          検索
        </button>
      </form>

      <div className="w-full flex flex-col justify-center items-center">
        {/* postsが存在し、かつ長さが0より大きい場合のみマップする */}
        {posts && posts.length > 0 ? (
          posts.map((post: PostType) => (
            <div
              key={post.id}
              className="w-3/4 p-4 rounded-md mx-3 my-2 bg-slate-500 flex flex-col justify-center"
            >
              <div className="flex items-center my-3">
                <div className="mr-auto">

                  <Link href={`/blog/${post.id}`}>
                    <h2 className="mr-auto font-semibold text-slate-50 hover:underline">
                      {post.title}
                    </h2>
                  </Link>
                </div>
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


            </div>
          ))
        ) : (
          // 記事がない場合の表示
          <p className="text-slate-500">記事がありません。新規作成してください。</p>
        )}
      </div>
    </main>
  );

}

