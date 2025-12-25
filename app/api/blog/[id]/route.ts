
import { NextResponse } from "next/server";
import { main } from "../route";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

//<<<ブログの詳細記事取得API>>>
//リクエスト(req)とレスポンス(res)を型指定で受け取る。
export const GET = async (req: Request, RES:NextResponse) =>{
    try{
        const id: number = parseInt(req.url.split("/blog/")[1]);//blogを区切る。[1]をidに入れる。
        await main();
        //接続が成功したら、一つのもの(findFirst)を取得する
                                        //┌ーーーーー[0]ーーーーーーー┐     ┌[1]┐
        //Post(schema.prisma)を呼び出す↓　　http://localhost:3000/api/blog/[3]←を取得する(id)
        const posts = await prisma.post.findFirst({where:{id}});
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