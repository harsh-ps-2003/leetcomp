"use server";

import { authActionClient } from "@/actions/safe-action";
import { dub } from "@/lib/dub";
import { shareLinkSchema } from "./schema";
import type { z } from "zod";

type ShareLinkInput = z.infer<typeof shareLinkSchema>;

export const shareLinkAction = authActionClient
  .schema(shareLinkSchema)
  .metadata({
    name: "share-link",
  })
  .action(async ({ parsedInput }: { parsedInput: ShareLinkInput }) => {
    const { postId, baseUrl } = parsedInput;
    const link = await dub.links.create({
      url: `${baseUrl}/post/${postId}`,
    });

    return link?.shortLink;
  });
