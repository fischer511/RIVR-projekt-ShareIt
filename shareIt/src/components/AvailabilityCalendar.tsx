import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Alert } from 'react-native';
import { Colors, Radius, Spacing } from '@src/constants/colors';
import { Ionicons } from '@expo/vector-icons';

type DateStatus = 'available' | 'booked';

interface CalendarDay {
  date: Date;
  status: DateStatus;
  price?: number;
  isBooked: boolean;
}

interface AvailabilityCalendarProps {
  pricePerDay: number;
  onBook: (selectedDates: Date[]) => void;
  bookedDates?: string[];
}

const AvailabilityCalendar: React.FC<AvailabilityCalendarProps> = ({ pricePerDay, onBook, bookedDates }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [rangeStart, setRangeStart] = useState<string | null>(null);
  const [rangeEnd, setRangeEnd] = useState<string | null>(null);

  const bookedSet = useMemo(() => new Set(bookedDates || []), [bookedDates]);

  const getDaysInMonth = (date: Date): CalendarDay[] => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();

    const days: CalendarDay[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 1; i <= daysInMonth; i++) {
      const dayDate = new Date(year, month, i);
      const dateStr = dayDate.toISOString().split('T')[0];
      const isBooked = bookedSet.has(dateStr);

      days.push({
        date: dayDate,
        status: isBooked ? 'booked' : 'available',
        price: pricePerDay,
        isBooked,
      });
    }

    return days;
  };

  const days = getDaysInMonth(currentMonth);
  const monthNames = ['Januar', 'Februar', 'Marec', 'April', 'Maj', 'Junij', 'Julij', 'Avgust', 'September', 'Oktober', 'November', 'December'];
  const dayNames = ['PO', 'TO', 'SR', 'ČE', 'PE', 'SO', 'NE'];

  const firstDayOfWeek = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
  const offset = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
    setRangeStart(null);
    setRangeEnd(null);
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
    setRangeStart(null);
    setRangeEnd(null);
  };

  const buildRange = (startIso: string, endIso: string) => {
    const start = new Date(startIso);
    const end = new Date(endIso);
    const dates: string[] = [];
    const dir = start <= end ? 1 : -1;
    const cursor = new Date(start);
    while ((dir === 1 && cursor <= end) || (dir === -1 && cursor >= end)) {
      dates.push(cursor.toISOString().split('T')[0]);
      cursor.setDate(cursor.getDate() + dir);
    }
    return dates;
  };

  const isRangeValid = (range: string[]) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return range.every((d) => {
      const dt = new Date(d);
      dt.setHours(0, 0, 0, 0);
      return !bookedSet.has(d) && dt >= today;
    });
  };

  const toggleDate = (day: CalendarDay) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (day.status === 'booked' || day.date < today) return;

    const dateStr = day.date.toISOString().split('T')[0];
    if (!rangeStart || (rangeStart && rangeEnd)) {
      setRangeStart(dateStr);
      setRangeEnd(null);
      return;
    }

    if (rangeStart && !rangeEnd) {
      if (dateStr === rangeStart) {
        setRangeStart(null);
        return;
      }
      const range = buildRange(rangeStart, dateStr);
      if (!isRangeValid(range)) {
        Alert.alert('Izberi razpon brez zasedenih dni.');
        return;
      }
      setRangeEnd(dateStr);
    }
  };

  const selectedDates = useMemo(() => {
    if (rangeStart && rangeEnd) return buildRange(rangeStart, rangeEnd);
    if (rangeStart) return [rangeStart];
    return [];
  }, [rangeStart, rangeEnd]);

  const handleBook = () => {
    const dates = selectedDates.map((d) => new Date(d));
    onBook(dates);
  };

  const getStatusColor = (status: DateStatus, isSelected: boolean, isPast: boolean) => {
    if (isSelected) return '#3B82F6';
    if (isPast) return '#E5E7EB';
    switch (status) {
      case 'available':
        return '#10B981';
      case 'booked':
        return '#EF4444';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={previousMonth} style={styles.navBtn}>
          <Ionicons name="chevron-back" size={24} color={Colors.black} />
        </Pressable>
        <Text style={styles.monthTitle}>{monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}</Text>
        <Pressable onPress={nextMonth} style={styles.navBtn}>
          <Ionicons name="chevron-forward" size={24} color={Colors.black} />
        </Pressable>
      </View>

      <View style={styles.weekdays}>
        {dayNames.map((day) => (
          <Text key={day} style={styles.weekday}>{day}</Text>
        ))}
      </View>

      <View style={styles.grid}>
        {Array.from({ length: offset }).map((_, i) => (
          <View key={`empty-${i}`} style={styles.emptyCell} />
        ))}

        {days.map((day, index) => {
          const dateStr = day.date.toISOString().split('T')[0];
          const isSelected = selectedDates.includes(dateStr);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const isPast = day.date < today;
          const isDisabled = day.isBooked || isPast;

          return (
            <Pressable
              key={index}
              style={[
                styles.dayCell,
                { backgroundColor: getStatusColor(day.status, isSelected, isPast) },
                isDisabled && !isSelected && styles.disabledCell,
              ]}
              onPress={() => toggleDate(day)}
              disabled={isDisabled}
            >
              <Text style={[styles.dayNumber, isDisabled && !isSelected && styles.disabledText]}>
                {day.date.getDate()}
              </Text>
              {!isPast && day.status === 'available' && !isSelected && (
                <Text style={styles.price}>{day.price} EUR</Text>
              )}
              {isSelected && (
                <Text style={styles.selectedMark}>Izbrano</Text>
              )}
            </Pressable>
          );
        })}
      </View>

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#10B981' }]} />
          <Text style={styles.legendText}>Prosto</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#EF4444' }]} />
          <Text style={styles.legendText}>Zasedeno</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#3B82F6' }]} />
          <Text style={styles.legendText}>Izbrano</Text>
        </View>
      </View>

      {selectedDates.length > 0 && (
        <View style={styles.footer}>
          <Text style={styles.totalText}>
            {selectedDates.length} dan/dni - Skupaj: {selectedDates.length * pricePerDay} EUR
          </Text>
          <Pressable style={styles.bookBtn} onPress={handleBook}>
            <Text style={styles.bookBtnText}>Rezerviraj izbrane datume</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
  },
  navBtn: {
    padding: Spacing.sm,
  },
  monthTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.black,
  },
  weekdays: {
    flexDirection: 'row',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.grayLight,
  },
  weekday: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    color: Colors.grayDark,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingVertical: Spacing.sm,
  },
  emptyCell: {
    width: '14.28%',
    aspectRatio: 1,
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 4,
    borderWidth: 1,
    borderColor: Colors.white,
  },
  disabledCell: {
    opacity: 0.5,
  },
  dayNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.white,
  },
  disabledText: {
    color: '#999',
  },
  price: {
    fontSize: 10,
    color: Colors.white,
    marginTop: 2,
  },
  selectedMark: {
    fontSize: 12,
    color: Colors.white,
    fontWeight: 'bold',
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.grayLight,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendColor: {
    width: 20,
    height: 20,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 12,
    color: Colors.grayDark,
  },
  footer: {
    padding: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.grayLight,
    gap: Spacing.sm,
  },
  totalText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.black,
    textAlign: 'center',
  },
  bookBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.md,
    alignItems: 'center',
  },
  bookBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.white,
  },
});

export default AvailabilityCalendar;
