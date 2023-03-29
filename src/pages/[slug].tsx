import {
  type GetServerSidePropsContext,
  type InferGetServerSidePropsType,
} from "next";
import Head from "next/head";
import Image from "next/image";

import { createProxySSGHelpers } from "@trpc/react-query/ssg";
import SuperJSON from "superjson";

import PageLayout from "~/components/layout";
import { appRouter } from "~/server/api/root";
import { prisma } from "~/server/db";
import { api } from "~/utils/api";

export default function ProfilePage({
  username,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const { data } = api.profile.getUserByUsername.useQuery({
    username,
  });

  if (!data) return <div>User not found</div>;

  return (
    <>
      <Head>
        <title>{data.username}</title>
      </Head>
      <PageLayout>
        <div className="relative h-40 bg-slate-600">
          <Image
            src={data.profileImageUrl}
            alt={`Profile image of ${data.username || "user"}`}
            width={128}
            height={128}
            className="absolute bottom-0 left-0 -mb-16 ml-4 rounded-full border-4 border-black bg-black"
          />
        </div>
        <div className="h-16" />
        <div className="border-b border-slate-400 p-4">
          <p className="text-2xl font-bold">@{data.username}</p>
        </div>
      </PageLayout>
    </>
  );
}

export async function getServerSideProps(
  context: GetServerSidePropsContext<{ slug: string }>
) {
  const ssg = createProxySSGHelpers({
    router: appRouter,
    ctx: { prisma, userId: null },
    transformer: SuperJSON,
  });

  const slug = context.params?.slug as string;
  if (typeof slug !== "string") throw new Error("Invalid slug");
  const username = slug.replace("@", "");

  /*
   * Prefetching the `post.byId` query here.
   * `prefetch` does not return the result and never throws - if you need that behavior, use `fetch` instead.
   */
  await ssg.profile.getUserByUsername.prefetch({ username });

  // Make sure to return { props: { trpcState: ssg.dehydrate() } }
  return {
    props: {
      trpcState: ssg.dehydrate(),
      username,
    },
  };
}
