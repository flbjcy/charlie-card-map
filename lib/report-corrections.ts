import corrections from './report-corrections.json';

// Corrections target a single report; preserve the original stored submission.
export function correctReport<T extends {id:string;station:string;design:string;machine:string}>(report:T):T {
 const correction=(corrections as Record<string,{station:string;design:string;originalMachine:string;machine:string}>)[report.id];
 return correction&&report.station===correction.station&&report.design===correction.design&&report.machine===correction.originalMachine
  ? {...report,machine:correction.machine}:report;
}
