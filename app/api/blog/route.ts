export const dynamic = 'force-dynamic';
import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

//データベース操作ロボット（PrismaClient）を変数に入れる
const prisma = new PrismaClient();
//async：この関数のペースで処理(非同期処理)
export async function main(){
    try{
        //データベース操作ロボット（PrismaClient）でデータベースに繋ぐ
        await prisma.$connect();//探す変数と繋ぐ
    }catch(err){
        return Error("DB接続に失敗しました");
    }
};

//<<<ブログの全記事取得用のAPI>>>
//リクエスト(req)とレスポンス(res)を型指定で受け取る。
export const GET = async (req: Request) =>{
    //URLからsearchクエリパラメータを取得する（例: /api/blog?search=タイトル）
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") ?? "";


    try{
        await main();
        //接続が成功したら、公開済みの記事(findMany)を取得する
        //Post(schema.prisma)を呼び出す↓　　await:処理が終わるまでこの関数だけ止める。
        //published: true の記事だけを取得
        //searchが空なら全件、値があればタイトルで部分一致検索する
        const posts = await prisma.post.findMany({
            where: {
                published: true,
                ...(search && {
                    title: { contains: search, mode: "insensitive" }
                }),
            },
        });
        //postを全て取得できたら、200(正常終了)をつけて、実行結果をJSONファイルにまとめて送る。
        return NextResponse.json({message:"Success", posts}, {status:200});

    }catch(err){//エラー時に実行
        //エラーが起きたら、500(サーバーエラー)をつけて、実行結果をJSONファイルに入れて送る。
        return NextResponse.json({message:"Error", err}, {status:500});

    }finally{//どちらでも実行される
        //接続を切る
        await prisma.$disconnect();
    }
};

//<<<ブログ投稿用のAPI>>>
//リクエスト(req)とレスポンス(res)を型指定で受け取る。
export const POST = async (req: Request, RES:NextResponse) =>{

    try{
        //reqからjson形式で、title, description, publishedを取り出す。
        const {title, description, published} = await req.json();
        
        await main();
        //接続が成功したら、reqにあるtitle, description, publishedをデータベースに入れる

        //非公開・公開がnullにならないようにする。
        let publishedValue = false;
        if (published !== undefined && published !== null) {
            publishedValue = published;
        }
        
        //Post(schema.prisma)を呼び出す↓　
        //publishedが送られてきた場合はその値を使い、送られてこなかった場合はfalseを使う
        const post = await prisma.post.create({data:{title, description, published: publishedValue}});
        //postを全て取得できたら、200(正常終了)をつけて、実行結果をJSONファイルにまとめて送る。
        return NextResponse.json({message:"Success", post}, {status:200});

    }catch(err){//エラー時に実行
        //エラーが起きたら、500(サーバーエラー)をつけて、実行結果をJSONファイルに入れて送る。
        return NextResponse.json({message:"Error", err}, {status:500});

    }finally{//どちらでも実行される
        //接続を切る
        await prisma.$disconnect();
    }
};
