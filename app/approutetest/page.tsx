import { getMessages } from 'next-intl/server';

export default async function Page() {
  const messages = await getMessages();

  return <div>{JSON.stringify(messages)}</div>;
}
