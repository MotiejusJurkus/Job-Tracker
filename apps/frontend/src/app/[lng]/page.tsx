import { Button } from '@/core/components/ui/button';
import { getTranslations } from '@/core/i18n/get-translations';
import { getSafeLng } from '@/core/i18n/language';
import { PostsList } from '@/features/posts/components/posts-list';

type Props = {
  params: Promise<{ lng: string }>;
};

const HomePage = async ({ params }: Props) => {
  const { lng } = await params;
  const t = getTranslations(getSafeLng(lng));

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-8 px-6 py-16">
      <header className="flex flex-col gap-3">
        <h1 className="text-3xl font-bold tracking-tight">{t.msg_home_title}</h1>
        <p className="text-muted-foreground">{t.msg_home_subtitle}</p>
        <div>
          <Button>{t.msg_home_cta}</Button>
        </div>
      </header>

      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold">{t.msg_posts_title}</h2>
        <PostsList />
      </section>
    </main>
  );
};

export default HomePage;
