import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Props {
  title: string;
  author: string;
  number: number;
  href?: string;
}

export function BookCard({
  title,
  author,
  number,
  href,
}: Props) {
  const content = (
    <>
      <div className="absolute -left-16 top-2 flex items-center justify-center bg-white rounded-full">
        <Avatar className="border size-12 m-auto">
          <AvatarFallback className="text-xs font-bold">{number}</AvatarFallback>
        </Avatar>
      </div>
      <div className="flex flex-1 flex-col justify-start gap-1">
        <h2 className="font-semibold leading-none">{title}</h2>
        <p className="text-sm text-muted-foreground">{author}</p>
      </div>
    </>
  );

  return (
    <li className="relative ml-10 py-4">
      {href ? (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="block hover:bg-muted/50 rounded-lg p-2 -m-2 transition-colors cursor-pointer"
        >
          {content}
        </a>
      ) : (
        content
      )}
    </li>
  );
} 