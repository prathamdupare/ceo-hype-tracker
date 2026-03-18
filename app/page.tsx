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
    return "Status Quo"
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
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg font-semibold">{claim.ceo}</CardTitle>
            <p className="text-sm text-muted-foreground">{claim.company}</p>
          </div>
          {isExpired && (
            <span className="rounded-full bg-red-500 px-2 py-1 text-xs font-bold text-white">
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
    <div className="min-h-svh p-6">
      <div className="absolute top-6 right-6">
        <ModeToggle />
      </div>
      <div className="mx-auto max-w-6xl space-y-12">
        <section className="py-12 text-center">
          <div className="inline-flex flex-col items-center">
            <span className="text-3xl text-muted-foreground">
              It&apos;s been
            </span>
            <span className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-9xl font-black text-transparent">
              {monthsSinceMostRecent}
            </span>
            <span className="text-2xl text-muted-foreground">
              months since the last &quot;AI will replace programmers&quot;
              claim.
            </span>
          </div>
        </section>

        <section>
          <h2 className="mb-6 flex items-center gap-2 text-2xl font-bold">
            <span className="text-green-500">●</span>
            Active Countdowns
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {activeCountdowns.map((claim) => (
              <ClaimCard key={claim.id} claim={claim} />
            ))}
          </div>
          {activeCountdowns.length === 0 && (
            <p className="text-muted-foreground">No active countdowns</p>
          )}
        </section>

        <section>
          <h2 className="mb-6 flex items-center gap-2 text-2xl font-bold">
            <span className="text-red-500">●</span>
            The Graveyard
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {graveyard.map((claim) => (
              <ClaimCard key={claim.id} claim={claim} />
            ))}
          </div>
          {graveyard.length === 0 && (
            <p className="text-muted-foreground">No expired predictions yet</p>
          )}
        </section>

        <section>
          <h2 className="mb-6 text-2xl font-bold">All Historical Claims</h2>
          <div className="rounded-md border">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-4 py-3 text-left text-sm font-medium">
                    CEO
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium">
                    Company
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium">
                    Claim
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium">
                    Category
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium">
                    Source
                  </th>
                </tr>
              </thead>
              <tbody>
                {historicalClaims.map((claim) => (
                  <tr key={claim.id} className="border-b">
                    <td className="px-4 py-3 text-sm">{claim.ceo}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {claim.company}
                    </td>
                    <td
                      className="max-w-xs truncate px-4 py-3 text-sm"
                      title={claim.claim}
                    >
                      &quot;{claim.claim}&quot;
                    </td>
                    <td className="px-4 py-3 text-sm">
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
                    <td className="px-4 py-3 text-sm">
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
