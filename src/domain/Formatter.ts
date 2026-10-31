const LOCALE = 'es-CO';

export class Formatter {
  private static readonly numberFormat = new Intl.NumberFormat(LOCALE);
  private static readonly compactFormat = new Intl.NumberFormat(LOCALE, { notation: 'compact', maximumFractionDigits: 1 });
  private static readonly longDateFormat = new Intl.DateTimeFormat(LOCALE, { day: 'numeric', month: 'long', year: 'numeric' });
  private static readonly weekdayFormat = new Intl.DateTimeFormat(LOCALE, { weekday: 'short' });
  private static readonly dayMonthFormat = new Intl.DateTimeFormat(LOCALE, { day: 'numeric', month: 'short' });
  private static readonly timeFormat = new Intl.DateTimeFormat(LOCALE, { hour: '2-digit', minute: '2-digit' });
  private static readonly fullDateFormat = new Intl.DateTimeFormat(LOCALE, { weekday: 'long', day: 'numeric', month: 'long' });
  private static readonly MORNING_STARTS_AT = 5;
  private static readonly AFTERNOON_STARTS_AT = 12;
  private static readonly EVENING_STARTS_AT = 19;

  static fullDate(date: Date): string {
    return Formatter.fullDateFormat.format(date);
  }

  static greeting(date: Date): string {
    const hour = date.getHours();
    if (hour >= Formatter.MORNING_STARTS_AT && hour < Formatter.AFTERNOON_STARTS_AT) {
      return 'Buenos días';
    }
    if (hour >= Formatter.AFTERNOON_STARTS_AT && hour < Formatter.EVENING_STARTS_AT) {
      return 'Buenas tardes';
    }
    return 'Buenas noches';
  }

  static number(value: number): string {
    return Formatter.numberFormat.format(value);
  }

  static compact(value: number): string {
    return Formatter.compactFormat.format(value);
  }

  static longDate(isoDate: string): string {
    return Formatter.longDateFormat.format(Formatter.parseLocalDate(isoDate));
  }

  static weekday(isoDate: string): string {
    return Formatter.weekdayFormat.format(Formatter.parseLocalDate(isoDate)).replace('.', '');
  }

  static dayMonth(isoDate: string): string {
    return Formatter.dayMonthFormat.format(Formatter.parseLocalDate(isoDate));
  }

  static time(date: Date): string {
    return Formatter.timeFormat.format(date);
  }

  static countdown(totalSeconds: number): string {
    const safeSeconds = Math.max(0, totalSeconds);
    const minutes = Math.floor(safeSeconds / 60);
    const seconds = safeSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  private static parseLocalDate(isoDate: string): Date {
    const [year, month, day] = isoDate.split('-').map(Number);
    return new Date(year, month - 1, day);
  }
}
