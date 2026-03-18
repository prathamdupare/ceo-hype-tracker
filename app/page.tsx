import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ModeToggle } from "@/components/mode-toggle"
import claims from "@/data/claims.json"
import {
  differenceInMonths,
  addMonths,
  isBefore,
  parseISO,
  format,
} from "date-fns"

interface Claim {
  id: string
  ceo: string
  company: string
  claim: string
  date_announced: string
  deadline_months: number | null
  source: { label: string; url: string }[]
}

const TODAY = new Date("2026-03-01")

function formatDate(dateStr: string): string {
  const date = parseISO(dateStr + "-01")
  return format(date, "MMMM yyyy")
}

function getClaimStats(claim: Claim) {
  const announced = parseISO(claim.date_announced + "-01")
  const deadline = claim.deadline_months ?? 0
  const deadlineDate = addMonths(announced, deadline)
  const monthsSinceAnnounced = differenceInMonths(TODAY, announced)
  const monthsRemaining =
    deadline > 0 ? differenceInMonths(deadlineDate, TODAY) : null
  const isExpired = deadline > 0 ? isBefore(deadlineDate, TODAY) : false

  return { monthsSinceAnnounced, monthsRemaining, isExpired }
}

function getClaimType(claim: Claim): string {
  const { isExpired } = getClaimStats(claim)

  if (claim.deadline_months === null) {
    return "Statement"
  }
  if (isExpired) {
    return "Graveyard"
  }
  return "Active"
}

function ClaimCard({ claim }: { claim: Claim }) {
  const { monthsRemaining, isExpired } = getClaimStats(claim)

  return (
    <Card
      className={`group ${isExpired ? "border-red-500 bg-red-50/50 dark:bg-red-950/20" : ""}`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <CardTitle className="text-base font-semibold sm:text-lg">
              {claim.ceo}
            </CardTitle>
            <p className="text-sm text-muted-foreground">{claim.company}</p>
          </div>
          {isExpired && (
            <span className="flex-shrink-0 rounded-full bg-red-500 px-2 py-1 text-xs font-bold text-white">
              EXPIRED
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <p
          className="mb-4 line-clamp-5 text-sm group-hover:line-clamp-none"
          title={claim.claim}
        >
          &quot;{claim.claim}&quot;
        </p>
        <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
          <span className="text-muted-foreground">
            {formatDate(claim.date_announced)}
          </span>
          {(claim.deadline_months ?? 0) > 0 && (
            <span
              className={`font-mono font-medium ${isExpired ? "text-red-500" : "text-green-600 dark:text-green-400"}`}
            >
              {isExpired
                ? `Missed by ${Math.abs(monthsRemaining!)} months`
                : `${monthsRemaining} months remaining`}
            </span>
          )}
        </div>
        {claim.source.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {claim.source.map((s, i) => (
              <a
                key={i}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-500 hover:underline"
              >
                {s.label}
              </a>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default function Page() {
  const allClaims: Claim[] = claims as Claim[]

  const recentDate = allClaims.reduce((latest, claim) => {
    const claimDate = parseISO(claim.date_announced + "-01")
    return claimDate > latest ? claimDate : latest
  }, new Date(0))

  const monthsSinceMostRecent = differenceInMonths(TODAY, recentDate)

  const activeCountdowns = allClaims.filter((claim) => {
    if ((claim.deadline_months ?? 0) <= 0) return false
    const { isExpired } = getClaimStats(claim)
    return !isExpired
  })

  const graveyard = allClaims.filter((claim) => {
    if ((claim.deadline_months ?? 0) <= 0) return false
    const { isExpired } = getClaimStats(claim)
    return isExpired
  })

  const historicalClaims = [...allClaims].sort(
    (a, b) =>
      parseISO(b.date_announced + "-01").getTime() -
      parseISO(a.date_announced + "-01").getTime()
  )

  return (
    <div className="min-h-svh p-4 sm:p-6">
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
        <ModeToggle />
      </div>
      <div className="mx-auto max-w-6xl space-y-12">
        <section className="py-8 text-center sm:py-12">
          <div className="inline-flex flex-col items-center">
            <span className="text-xl text-muted-foreground sm:text-3xl">
              It&apos;s been
            </span>
            <span className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-6xl font-black text-transparent sm:text-8xl md:text-9xl">
              {monthsSinceMostRecent}
            </span>
            <span className="text-lg text-muted-foreground sm:text-2xl">
              months since the last &quot;AI will replace programmers&quot;
              claim.
            </span>
          </div>
        </section>

        <section>
          <h2 className="mb-6 flex items-center gap-2 text-xl font-bold sm:text-2xl">
            <span className="text-green-500">●</span>
            Active Countdowns
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {activeCountdowns.map((claim) => (
              <ClaimCard key={claim.id} claim={claim} />
            ))}
          </div>
          {activeCountdowns.length === 0 && (
            <p className="text-muted-foreground">No active countdowns</p>
          )}
        </section>

        <section>
          <h2 className="mb-6 flex items-center gap-2 text-xl font-bold sm:text-2xl">
            <span className="text-red-500">●</span>
            The Graveyard
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {graveyard.map((claim) => (
              <ClaimCard key={claim.id} claim={claim} />
            ))}
          </div>
          {graveyard.length === 0 && (
            <p className="text-muted-foreground">No expired predictions yet</p>
          )}
        </section>

        <section>
          <h2 className="mb-6 text-xl font-bold sm:text-2xl">
            All Historical Claims
          </h2>
          <div className="grid gap-4 md:hidden">
            {historicalClaims.map((claim) => (
              <Card
                key={claim.id}
                className={`p-4 ${(claim.deadline_months ?? 0) > 0 && claim.deadline_months !== null && isBefore(addMonths(parseISO(claim.date_announced + "-01"), claim.deadline_months), TODAY) ? "border-red-500" : ""}`}
              >
                <div className="mb-2 flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold">{claim.ceo}</p>
                    <p className="text-xs text-muted-foreground">
                      {claim.company}
                    </p>
                  </div>
                  <span
                    className={`inline-flex flex-shrink-0 rounded-full px-2 py-1 text-xs whitespace-nowrap ${
                      getClaimType(claim) === "Graveyard"
                        ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                        : getClaimType(claim) === "Active"
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                          : "bg-secondary text-secondary-foreground"
                    }`}
                  >
                    {getClaimType(claim)}
                  </span>
                </div>
                <p
                  className="line-clamp-2 text-xs text-muted-foreground"
                  title={claim.claim}
                >
                  &quot;{claim.claim}&quot;
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  {formatDate(claim.date_announced)}
                </p>
              </Card>
            ))}
          </div>
          <div className="hidden md:block md:overflow-hidden md:rounded-md md:border">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-4 py-3 text-left text-sm font-medium">
                    CEO
                  </th>
                  <th className="hidden px-4 py-3 text-left text-sm font-medium lg:table-cell">
                    Company
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium">
                    Claim
                  </th>
                  <th className="hidden px-4 py-3 text-left text-sm font-medium xl:table-cell">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium">
                    Category
                  </th>
                  <th className="hidden px-4 py-3 text-left text-sm font-medium 2xl:table-cell">
                    Source
                  </th>
                </tr>
              </thead>
              <tbody>
                {historicalClaims.map((claim) => (
                  <tr key={claim.id} className="border-b">
                    <td className="px-4 py-3 text-sm">{claim.ceo}</td>
                    <td className="hidden px-4 py-3 text-sm text-muted-foreground lg:table-cell">
                      {claim.company}
                    </td>
                    <td
                      className="max-w-xs truncate px-4 py-3 text-sm"
                      title={claim.claim}
                    >
                      &quot;{claim.claim}&quot;
                    </td>
                    <td className="hidden px-4 py-3 text-sm xl:table-cell">
                      {formatDate(claim.date_announced)}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs whitespace-nowrap ${
                          getClaimType(claim) === "Graveyard"
                            ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                            : getClaimType(claim) === "Active"
                              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                              : "bg-secondary text-secondary-foreground"
                        }`}
                      >
                        {getClaimType(claim)}
                      </span>
                    </td>
                    <td className="hidden px-4 py-3 text-sm 2xl:table-cell">
                      {claim.source.map((s, i) => (
                        <span key={i}>
                          {i > 0 && (
                            <span className="mx-1 text-muted-foreground">
                              •
                            </span>
                          )}
                          <a
                            href={s.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:underline"
                          >
                            {s.label}
                          </a>
                        </span>
                      ))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <footer className="mt-12 text-center text-sm text-muted-foreground">
          <p>
            You think the data is wrong?{" "}
            <a
              href="https://github.com/prathamdupare/ceo-hype-tracker/issues"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            >
              File an issue here!
            </a>
          </p>
        </footer>
      </div>
    </div>
  )
}
