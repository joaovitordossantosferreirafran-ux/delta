import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const DashboardScreen = ({ navigation }) => {
  const [user] = useState({
    name: 'Maria Silva',
    role: 'client',
    avatar: '👩',
    balance: 500,
  });

  const [upcomingBookings] = useState([
    {
      id: 1,
      cleaner: 'João Silva',
      date: '2026-01-28',
      time: '10:00',
      address: 'Rua das Flores, 123',
      status: 'confirmado',
      image: '👨‍🔧',
    },
    {
      id: 2,
      cleaner: 'Ana Costa',
      date: '2026-02-05',
      time: '14:00',
      address: 'Av. Paulista, 1000',
      status: 'confirmado',
      image: '👩‍🔧',
    },
  ]);

  const quickActions = [
    { id: 1, name: 'Agendar', icon: 'calendar', color: '#3B82F6' },
    { id: 2, name: 'Minhas Limpezas', icon: 'list', color: '#10B981' },
    { id: 3, name: 'Indicar', icon: 'share-social', color: '#8B5CF6' },
    { id: 4, name: 'Suporte', icon: 'help-circle', color: '#F59E0B' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Olá, {user.name}! 👋</Text>
            <Text style={styles.subGreeting}>Bem-vindo ao CleanApp</Text>
          </View>
          <Text style={styles.avatar}>{user.avatar}</Text>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Ionicons name="cash" size={24} color="#10B981" />
            <Text style={styles.statValue}>R$ {user.balance}</Text>
            <Text style={styles.statLabel}>Créditos</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="star" size={24} color="#F59E0B" />
            <Text style={styles.statValue}>4.8</Text>
            <Text style={styles.statLabel}>Avaliação</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="checkmark-circle" size={24} color="#3B82F6" />
            <Text style={styles.statValue}>12</Text>
            <Text style={styles.statLabel}>Limpezas</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsContainer}>
          <Text style={styles.sectionTitle}>Ações Rápidas</Text>
          <View style={styles.actionsGrid}>
            {quickActions.map(action => (
              <TouchableOpacity
                key={action.id}
                style={[styles.actionButton, { backgroundColor: action.color }]}
              >
                <Ionicons name={action.icon} size={32} color="white" />
                <Text style={styles.actionText}>{action.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Upcoming Bookings */}
        <View style={styles.bookingsContainer}>
          <Text style={styles.sectionTitle}>Próximas Limpezas</Text>
          {upcomingBookings.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Nenhuma limpeza agendada</Text>
              <TouchableOpacity style={styles.scheduleButton}>
                <Text style={styles.scheduleButtonText}>Agendar Agora</Text>
              </TouchableOpacity>
            </View>
          ) : (
            upcomingBookings.map(booking => (
              <View key={booking.id} style={styles.bookingCard}>
                <View style={styles.bookingHeader}>
                  <Text style={styles.cleanerName}>{booking.cleaner}</Text>
                  <View
                    style={[
                      styles.statusBadge,
                      booking.status === 'confirmado' && styles.confirmedStatus,
                    ]}
                  >
                    <Text style={styles.statusText}>✓ {booking.status}</Text>
                  </View>
                </View>

                <View style={styles.bookingDetails}>
                  <View style={styles.detailRow}>
                    <Ionicons name="calendar" size={16} color="#666" />
                    <Text style={styles.detailText}>
                      {new Date(booking.date).toLocaleDateString('pt-BR')} às {booking.time}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Ionicons name="location" size={16} color="#666" />
                    <Text style={styles.detailText} numberOfLines={1}>
                      {booking.address}
                    </Text>
                  </View>
                </View>

                <TouchableOpacity style={styles.contactButton}>
                  <Ionicons name="chatbubble-ellipses" size={16} color="white" />
                  <Text style={styles.contactButtonText}>Enviar Mensagem</Text>
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>

        {/* Promotions */}
        <View style={styles.promotionContainer}>
          <View style={styles.promotionCard}>
            <Text style={styles.promotionTitle}>🎁 Ganhe R$ 50!</Text>
            <Text style={styles.promotionText}>Indique uma faxineira e ganhe créditos</Text>
            <TouchableOpacity
              style={styles.promotionButton}
              onPress={() => navigation.navigate('Referral')}
            >
              <Text style={styles.promotionButtonText}>Ver Mais</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Footer Spacing */}
        <View style={styles.footer} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  greeting: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
  },
  subGreeting: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  avatar: {
    fontSize: 40,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 8,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  actionsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 8,
  },
  actionButton: {
    width: '48%',
    paddingVertical: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  actionText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 8,
  },
  bookingsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  emptyContainer: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    paddingVertical: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 16,
  },
  scheduleButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  scheduleButtonText: {
    color: '#FFF',
    fontWeight: '600',
  },
  bookingCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cleanerName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
  },
  statusBadge: {
    backgroundColor: '#D1D5DB',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  confirmedStatus: {
    backgroundColor: '#DCFCE7',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#166534',
  },
  bookingDetails: {
    gap: 8,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#4B5563',
    flex: 1,
  },
  contactButton: {
    backgroundColor: '#3B82F6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 8,
  },
  contactButtonText: {
    color: '#FFF',
    fontWeight: '600',
  },
  promotionContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  promotionCard: {
    backgroundColor: '#8B5CF6',
    borderRadius: 12,
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  promotionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 8,
  },
  promotionText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 16,
  },
  promotionButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
  },
  promotionButtonText: {
    color: '#FFF',
    fontWeight: '600',
  },
  footer: {
    height: 40,
  },
});

export default DashboardScreen;
