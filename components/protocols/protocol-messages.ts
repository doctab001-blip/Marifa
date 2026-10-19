export const protocolMessages: Record<string, string> = {
  invalid_id: "That protocol link is not valid.",
  not_found: "That protocol could not be found.",
  not_a_draft: "Only a draft can be published or deleted.",
  not_published: "Only a published protocol can be returned to Draft.",
  invalid_content: "The protocol content does not match the required format. Open it in the editor and repair it first.",
  below_threshold: "This protocol is below the 80% authoring score needed to publish. Complete the missing sections first.",
  publish_failed: "The protocol could not be published. Nothing was changed; try again.",
  revert_failed: "The protocol could not be returned to Draft. Nothing was changed; try again.",
  delete_failed: "The draft could not be deleted. Try again.",
};
