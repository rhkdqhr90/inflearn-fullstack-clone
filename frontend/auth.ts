import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/prisma";
import CredentialsProvider from "next-auth/providers/credentials";
import { comparePassword } from "./lib/password-utils";

export const { handlers, auth, signIn, signOut } = NextAuth({
  useSecureCookies: process.env.NODE_ENV === "production",
  trustHost: true,
  adapter: PrismaAdapter(prisma),
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "이메일 입력" },
        password: {
          label: "Password",
          type: "password",
          placeholder: "비밀번호 입력",
        },
      },
      async authorize(credentials) {
        //1. 모든 값들이 정상적으로 들어왔는가?
        if (!credentials.email || !credentials.password || !credentials) {
          throw new Error("이메일과 비밀번호를 입력해 주세요");
        }
        //2.DB에서 유저를 찾기
        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email as string,
          },
        });
        if (!user) {
          throw new Error("존재하지 않는 이메일입니다.");
        }
        //3. 비밀번호가 일치하는가?
        const passwordMatch = comparePassword(
          credentials.password as string,
          user.hashedPassword as string
        );
        if (!passwordMatch) {
          throw new Error("비밀번호가 일치하지 않습니다.");
        }
        return user;
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {},
  callbacks: {}
});
