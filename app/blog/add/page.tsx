"use client"

import { handleBuildComplete } from "next/dist/build/adapter/build-complete";
import { HtmlContext } from "next/dist/server/route-modules/pages/vendored/contexts/entrypoints";
import { Hammersmith_One } from "next/font/google";
import { title } from "process";
import React, { useRef } from "react";

const postBlog = async (
    title:string|undefined,
    description:string|undefined
) => {
  const res = await fetch(`http://localhost:3000/api/blog`,{
    method: "POST",
    headers: {
        "Content-Type":"applicattion/json",
    },
    body: JSON.stringify({title,description}),
  });

  return res.json();
};

const PostBlog = () => {
    //useRefは属性が取得できる。
    const titleRef = useRef<HTMLInputElement|null>(null);
    const descriptionRef = useRef<HTMLTextAreaElement|null>(null);

    //送信ボタンが押されたら、
    const handleSubmit = async(e: React.FormEvent) =>{
        //真っ白になる再読み込みを防ぐ
        e.preventDefault();
        //送信した時の文字を見る
        //「？」があることでクラッシュせずに、undefinedを返す。
        console.log(titleRef.current?.value);
        console.log(descriptionRef.current?.value);
        await postBlog(titleRef.current?.value, descriptionRef.current?.value)
    }

    return (<>
  <div className="w-full m-auto flex my-4">
    <div className="flex flex-col justify-center items-center m-auto">
      <p className="text-2xl text-slate-200 font-bold p-3">ブログ新規作成 🚀</p>
      <form onSubmit={handleSubmit}>
        <input
          ref={titleRef}
          placeholder="タイトルを入力"
          type="text"
          className="rounded-md px-4 w-full py-2 my-2 bg-white border border-gray-300"
        />
        <textarea
          ref = {descriptionRef}
          placeholder="記事詳細を入力"
          className="rounded-md px-4 py-2 w-full my-2 bg-white border border-gray-300"
        ></textarea>
        <button className="font-semibold px-4 py-2 shadow-xl bg-slate-200 rounded-lg m-auto hover:bg-slate-100">
          投稿
        </button>
      </form>
    </div>
  </div>
</>);
};
export default PostBlog;