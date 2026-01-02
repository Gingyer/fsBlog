import { fsync } from "fs";
import Image from "next/image";
import Link from "next/link";
import { PostType } from "./types";

async function fetchAllBlogs() {
  // 修正1: エラーハンドリングを追加
  // fetchはURLが間違っていると失敗します
  const res = await fetch(`http://localhost:3000/api/blog`, {
    cache: "no-store", 
  });

  // 修正2: 変数名を date ではなく data に変更（わかりやすくするため）
  const data = await res.json();
  
  // ★重要: ここでターミナルに何が出るか確認してください
  console.log("APIからの返事:", data);

  // もしAPI側でエラーが起きていたら、postsは存在しないので空配列を返す
  if (!data.posts) {
    console.log("記事が見つかりませんでした、またはエラーです。");
    return [];
  }

  return data.posts;
}

export default async function Home() {
  const posts = await fetchAllBlogs();

  return (
    <main className="w-full h-full">
      <div className="md:w-2/4 sm:w-3/4 m-auto p-4 my-5 rounded-lg bg-blue-900 drop-shadow-xl">
        <h1 className="text-slate-200 text-center text-2xl font-extrabold">
          Full Stack Blog 📝
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
                  <h2 className="mr-auto font-semibold text-slate-50">
                    {post.title}
                  </h2>
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

              <div className="mr-auto my-1">
                <h2 className="font-bold text-slate-50">
                  {post.description}
                </h2>
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