'use client';

export default function Page() {
  setTimeout(() => {
    throw new Error('An Error');
  }, 1000);
  return <div>ERROR TESTING PAGE</div>;
}
