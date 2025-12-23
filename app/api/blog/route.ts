import { PrismaClient } from "@prisma/client";
import { SegmentPrefixRSCPathnameNormalizer } from "next/dist/server/normalizers/request/segment-prefix-rsc";
import { NextResponse } from "next/server";

//データベース操作ロボット（PrismaClient）を変数に入れる
const prisma = new PrismaClient();
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
export const GET = async (req: Request, RES:NextResponse) =>{
    try{
        await main();
        //接続が成功したら、全記事(findMany)を取得する
        //Post(schema.prisma)を呼び出す↓
        const posts = await prisma.post.findMany();
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
