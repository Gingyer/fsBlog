"use client";
import { useRouter } from "next/navigation";
import React, { useRef } from "react";
import toast from "react-hot-toast";

const editBlog = async (
    title:string|undefined,
    description:string|undefined,
    id:number
) => {
  const res = await fetch(`http://localhost:3000/api/blog/${id}`,{
    method: "PUT",
    headers: {
        "Content-Type":"applicattion/json",
    },
    body: JSON.stringify({title,description,id}),
  });

  return res.json();
};



    
const EditPost = ({params}: {params:{id:number}}) => {
  const router = useRouter();
  //useRefは属性が取得できる。
  const titleRef = useRef<HTMLInputElement|null>(null);
  const descriptionRef = useRef<HTMLTextAreaElement|null>(null);

  
    //送信ボタンが押されたら、
  const handleSubmit = async(e: React.FormEvent) =>{
      //真っ白になる再読み込みを防ぐ
      e.preventDefault();
      toast.loading("編集中です....",{id:"1"});
      //送信した時の文字を見る
      //「？」があることでクラッシュせずに、undefinedを返す。
      await editBlog(
        titleRef.current?.value, 
        descriptionRef.current?.value,
        params.id
      );

      toast.success("編集に成功しました!",{id:"1"});

      //投稿ボタンを押したら、一つ前に戻る
      router.push("/");
      router.refresh();
  }
    return (<>
  <div className="w-full m-auto flex my-4">
    <div className="flex flex-col justify-center items-center m-auto">
      <p className="text-2xl text-slate-200 font-bold p-3">ブログの編集 🚀</p>
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
        <button className="font-semibold px-4 py-2 shadow-xl bg-slate-200 rounded-lg m-auto hover:bg-slate-100">
          更新
        </button>
        <button className="ml-2 font-semibold px-4 py-2 shadow-xl bg-red-400 rounded-lg m-auto hover:bg-slate-100">
          削除
        </button>
      </form>
    </div>
  </div>
</>);
};

export default EditPost;
