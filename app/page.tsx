import { fsync } from "fs";
import Image from "next/image";
import Link from "next/link";
import { PostType } from "./types";

async function fetchAllBlogs() {
  //regoin 最新のブログ記事データを、APIから取得してくる
  //no-storeは常に最新情報を表示する（SSR）　　　　
  //no-storeの意味は「過去の記憶を持たずに、今のデータだけを持ち続ける」
  //fetch(...)はインターネット上からデータを取りに行くコマンド
  //endregoin
  const res = await fetch(`http://localhost:3000/api/blog`,{
    cache: "no-store", //SSR
  });
  //regoin data(JSON形式)の中のpostsを返す　
  //postsである「」の部分返す
  //{
  //"message":"Success",
  // 「「「"posts":[
  //    {
  //      "id":2,
  //      "title":"test2",
  //      "description":"test2",
  //      "data":"2025-12-25T13:00:18.912Z"
  //    },
  //  ]」」」」」」
  //}
  //endregoin
  const date = await res.json();
  return date.posts;
}

//regoin 日付を出力する。
//new Date(post.date)の形で、日付ロボットを作って、
//toDateString()で人間の読みやすい形にする。
//"Thu Dec 25 2025"のような形になる。
//String(post.date)だと、"2025-12-25T13:00:18.912Z"
//になってしまうため、使っていない。
//endregoin
/* <div className="mr-auto my-1">
  <blockquote className="font-bold text-slate-50">
  「「「
    {new Date(post.date).toDateString()}
   」」」
    </blockquote>
</div> */


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
        {posts.map((post: PostType) => (
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
              {/* 👇 修正箇所3：説明文を表示 */}
              <h2 className="font-bold text-slate-50">
                {post.description}
              </h2>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}