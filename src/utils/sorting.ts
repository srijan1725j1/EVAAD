import { Argument, SortFilter } from '../types';

export interface RankedArgument extends Argument {
  sideRank: number; // 1-indexed within its side
}

export function sortAndInterleaveArguments(
  args: Argument[],
  filter: SortFilter = 'alternating'
): RankedArgument[] {
  const forArgs = args.filter((a) => a.side === 'for');
  const againstArgs = args.filter((a) => a.side === 'against');

  // Sort by likes descending; tie-break by timestamp
  const sortedFor: RankedArgument[] = [...forArgs]
    .sort((a, b) => {
      if (b.likes !== a.likes) return b.likes - a.likes;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    })
    .map((item, idx) => ({ ...item, sideRank: idx + 1 }));

  const sortedAgainst: RankedArgument[] = [...againstArgs]
    .sort((a, b) => {
      if (b.likes !== a.likes) return b.likes - a.likes;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    })
    .map((item, idx) => ({ ...item, sideRank: idx + 1 }));

  if (filter === 'for') {
    return sortedFor;
  }

  if (filter === 'against') {
    return sortedAgainst;
  }

  if (filter === 'live') {
    return [...args]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .map((item, idx) => ({ ...item, sideRank: idx + 1 }));
  }

  // Interleaved A1, B1, A2, B2, A3, B3...
  const maxLength = Math.max(sortedFor.length, sortedAgainst.length);
  const result: RankedArgument[] = [];

  for (let i = 0; i < maxLength; i++) {
    if (i < sortedFor.length) {
      result.push(sortedFor[i]);
    }
    if (i < sortedAgainst.length) {
      result.push(sortedAgainst[i]);
    }
  }

  return result;
}
