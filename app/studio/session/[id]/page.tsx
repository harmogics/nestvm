import { Workbench } from "@/components/workbench";

export default async function SessionPage(context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  return <Workbench sessionId={id} />;
}
