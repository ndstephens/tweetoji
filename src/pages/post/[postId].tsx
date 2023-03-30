import {
  type GetServerSidePropsContext,
  type InferGetServerSidePropsType,
} from "next";
import Head from "next/head";

import PageLayout from "~/components/layout";
import { PostView } from "~/components/postView";
import { generateSSGHelper } from "~/server/helpers/ssgHelper";
import { api } from "~/utils/api";

//* =============================================
//*               PROFILE PAGE                  =
//*==============================================
export default function SinglePostPage({
  postId,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const { data } = api.posts.getById.useQuery({
    id: postId,
  });

  if (!data) return <div>Post not found</div>;

  return (
    <>
      <Head>
        <title>
          {data.post.content} - @{data.author.username}
        </title>
      </Head>
      <PageLayout>
        <PostView post={data.post} author={data.author} />
      </PageLayout>
    </>
  );
}

export async function getServerSideProps(
  context: GetServerSidePropsContext<{ postId: string }>
) {
  const ssg = generateSSGHelper();

  const postId = context.params?.postId;
  if (typeof postId !== "string") throw new Error("Invalid postId");

  /*
   * `prefetch` does not return the result and never throws - if you need that behavior, use `fetch` instead.
   */
  await ssg.posts.getById.prefetch({ id: postId });

  // Make sure to return { props: { trpcState: ssg.dehydrate() } }
  return {
    props: {
      trpcState: ssg.dehydrate(),
      postId,
    },
  };
}
