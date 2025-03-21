export default function CryptoListSkeleton() {
  return (
    <div className="space-y-4 p-4">
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          className="flex animate-pulse items-center justify-between rounded-lg bg-muted p-4"
        >
          <div className="h-12 w-12 rounded-full bg-muted-foreground/20" />
          <div className="h-4 w-24 rounded bg-muted-foreground/20" />
          <div className="h-4 w-16 rounded bg-muted-foreground/20" />
        </div>
      ))}
    </div>
  );
}
