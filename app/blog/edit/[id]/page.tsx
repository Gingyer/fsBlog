"use client";
import { useRouter } from "next/navigation";
import React, { useRef, use, useEffect, useState} from "react";
import toast from "react-hot-toast";

//サーバーに送る形式
const editBlog = async (
    title:string|undefined,
    description:string|undefined,
    published:boolean,
    id:number
) => {
  const res = await fetch(`http://localhost:3000/api/blog/${id}`,{
    //上書き保存（PUT）
    method: "PUT",
    //中身はJSON形式のテキスト
    headers: {
        "Content-Type":"application/json",
    },
    //テキストに変換
    body: JSON.stringify({title,description,published,id}),
  });
  //サーバーから返ってきた生の通信データ
  return res.json();
};
//編集時に反映させる
const getBlogById = async (id:number) => {
  //パスからデータを取ってきて、json形式にする
  const res = await fetch(`http://localhost:3000/api/blog/${id}`);
  const data = await res.json();
  // regoin データのposts部分だけ切り取って送る
  //     "message": "Success",
  // 「「「"posts": [
  //   　 {
        //     "id": 1,
        //     "title": "test1-updata",
        //     "description": "test1-update",
        //     "date": "2025-12-27T05:25:23.211Z"
        // },」」」
  // endregoin
  return data.posts;
};
//記事を削除する
const deleteBlog = async (id:number) => {
  const res = await fetch(`http://localhost:3000/api/blog/${id}`,{
    //削除（DELETE）
    method: "DELETE",
    //中身はJSON形式のテキスト
    headers: {
        "Content-Type":"application/json",
    },
  });
  //サーバーから返ってきた生の通信データ
  return res.json();
};
//ブラウザのURLが、ファイルの場所と一致した瞬間 
const EditPost = ({params}: {params:Promise<{id:number}>}) => {
  //トップページに切り替える
  const router = useRouter();
  //paramsからuseを使って,idを取り出す
  const{id} = use(params);
  // regoin useRefは属性が取得できる。
  // <input ref={titleRef} />と繋げられる。
  // titleRef.current.valueのみで入力欄の文字を取り出せる。
  // endregoin
  const titleRef = useRef<HTMLInputElement|null>(null);
  const descriptionRef = useRef<HTMLTextAreaElement|null>(null);
  const [published, setIsPublished] = useState<boolean>(false);

  
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
        published,
        Number(id)
      );

      toast.success("編集に成功しました!",{id:"1"});

      //一つ前に戻って、情報の更新する
      router.push("/");
      router.refresh();
  };
  //削除ボタンが押されたら、
  const handleDelete = async () => {
    toast.loading("削除中です・・・")
    //削除する
    await deleteBlog(Number(id));
    //一つ前に戻って、情報の更新する
    router.push("/");
    router.refresh();
  };
  //編集時に前回の記述を記入する(表示時に一回だけ)
  useEffect(()=>{
          //L画面に表示されたら、
    //thenがdataが送られるまで待つ
    getBlogById(Number(id)).then((data)=>{
      //もしtitleRefとdescriptionRefにデータが入っていたら、
      if(titleRef.current && descriptionRef.current){
        //タイトルと説明のデータを書き換える
        titleRef.current.value = data.title;
        descriptionRef.current.value = data.description;
        //公開状態も反映
        setIsPublished(data.published ?? false);
      }
    }).catch(err=>{
      toast.error("エラーが発生しました。",{id:"1"});
    });
  },[]);
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
        
        {/* 公開設定のUI */}
        <div className="flex items-center gap-2 mb-4">
          <input
            id="publish-checkbox-edit"
            type="checkbox"
            checked={published}
            onChange={(e) => setIsPublished(e.target.checked)}
            className="w-4 h-4 cursor-pointer"
          />
          <label htmlFor="publish-checkbox-edit" className="text-slate-200 cursor-pointer">
            公開する
          </label>
        </div>

        <button className="font-semibold px-4 py-2 shadow-xl bg-slate-200 rounded-lg m-auto hover:bg-slate-100">
          更新
        </button>
        <button onClick={handleDelete} 
        className="ml-2 font-semibold px-4 py-2 shadow-xl bg-red-400 rounded-lg m-auto hover:bg-slate-100">
          削除
        </button>
      </form>
    </div>
  </div>
</>);
};

export default EditPost;
