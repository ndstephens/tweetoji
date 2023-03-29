import {
  type GetServerSidePropsContext,
  type InferGetServerSidePropsType,
} from "next";
import Head from "next/head";

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
        <div>{data.username}</div>
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
