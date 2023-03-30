import {
  type GetServerSidePropsContext,
  type InferGetServerSidePropsType,
} from "next";
import Head from "next/head";
import Image from "next/image";

import PageLayout from "~/components/layout";
import { LoadingPage } from "~/components/Loading";
import { PostView } from "~/components/postView";
import { generateSSGHelper } from "~/server/helpers/ssgHelper";
import { api } from "~/utils/api";

function ProfileFeed({ userId }: { userId: string }) {
  const { data, isLoading } = api.posts.getPostsByUserId.useQuery({ userId });

  if (isLoading) return <LoadingPage />;

  if (!data || data.length === 0) return <div>User has not posted yet</div>;

  return (
    <div className="flex flex-col">
      {data.map(({ post, author }) => (
        <PostView key={post.id} post={post} author={author} />
      ))}
    </div>
  );
}

//* =============================================
//*               PROFILE PAGE                  =
//*==============================================
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
        <ProfileFeed userId={data.id} />
      </PageLayout>
    </>
  );
}

export async function getServerSideProps(
  context: GetServerSidePropsContext<{ slug: string }>
) {
  const ssg = generateSSGHelper();

  const slug = context.params?.slug;
  if (typeof slug !== "string") throw new Error("Invalid slug");
  const username = slug.replace("@", "");

  /*
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
