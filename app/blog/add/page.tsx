"use client"

import { handleBuildComplete } from "next/dist/build/adapter/build-complete";
import { HtmlContext } from "next/dist/server/route-modules/pages/vendored/contexts/entrypoints";
import { Hammersmith_One } from "next/font/google";
import { useRouter } from "next/navigation";
import { title } from "process";
import React, { useRef, useState } from "react";
import toast, { Toaster } from "react-hot-toast";

//サーバーに送る形式
const postBlog = async (
    title:string|undefined,
    description:string|undefined,
    published:boolean
) => {
  const res = await fetch(`http://localhost:3000/api/blog`,{
    //新規作成（POST）
    method: "POST",
    //中身はJSON形式のテキスト
    headers: {
        "Content-Type":"application/json",
    },
    //テキストに変換
    body: JSON.stringify({title,description,published}),
  });
  //サーバーから返ってきた生の通信データ
  return res.json();
};
//ブラウザのURLが、ファイルの場所と一致した瞬間
const PostBlog = () => {
    const router = useRouter();
    //useRefは属性が取得できる。
    const titleRef = useRef<HTMLInputElement|null>(null);
    const descriptionRef = useRef<HTMLTextAreaElement|null>(null);
    const [published, setIsPublished] = useState<boolean>(false);
    //送信ボタンが押されたら、
    const handleSubmit = async(e: React.FormEvent) =>{
        //真っ白になる再読み込みを防ぐ
        e.preventDefault();
        toast.loading("投稿中です....",{id:"1"});
        //送信した時の文字を見る
        //「？」があることでクラッシュせずに、undefinedを返す。
        await postBlog(titleRef.current?.value, descriptionRef.current?.value, published);

        toast.success("投稿に成功しました!",{id:"1"});

        //投稿ボタンを押したら、一つ前に戻る
        router.push("/");
        router.refresh();
    }

return (
        <>
            <Toaster />
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
                            ref={descriptionRef}
                            placeholder="記事詳細を入力"
                            className="rounded-md px-4 py-2 w-full my-2 bg-white border border-gray-300"
                        ></textarea>
                        
                        {/* 修正点4: 公開設定のUI */}
                        <div className="flex items-center gap-2 mb-4">
                             <input
                                id="publish-checkbox"
                                type="checkbox"
                                checked={published}
                                onChange={(e) => setIsPublished(e.target.checked)}
                                className="w-4 h-4 cursor-pointer"
                            />
                            <label htmlFor="publish-checkbox" className="text-slate-200 cursor-pointer">
                                公開する
                            </label>
                        </div>

                        <button className="font-semibold px-4 py-2 shadow-xl bg-slate-200 rounded-lg m-auto hover:bg-slate-100">
                            投稿
                        </button>
                    </form>
                </div>
            </div>
        </>
    );
};
export default PostBlog;