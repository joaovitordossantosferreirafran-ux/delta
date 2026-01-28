const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Service para gerenciar bônus de faxineiras
 * Lógica: 10 avaliações 5★ seguidas = R$ 100 de bônus
 */

/**
 * Verifica se faxineira completou 10 avaliações 5★ seguidas e concede bônus
 */
async function checkAndAwardBonus(cleanerId) {
  try {
    const cleaner = await prisma.cleaner.findUnique({
      where: { id: cleanerId },
      include: {
        reviews: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          select: { rating: true }
        }
      }
    });

    if (!cleaner) {
      throw new Error('Faxineira não encontrada');
    }

    // Verifica se tem 10 reviews e todas são 5★
    if (cleaner.reviews.length >= 10) {
      const lastTenReviews = cleaner.reviews.slice(0, 10);
      const allFiveStars = lastTenReviews.every(r => r.rating === 5);

      if (allFiveStars) {
        // Criar bônus
        const bonus = await prisma.cleanerBonus.create({
          data: {
            cleanerId: cleaner.id,
            amount: 100.00,
            reason: '10_consecutive_five_stars',
            status: 'pending'
          }
        });

        // Atualizar badge TOP CLEANER
        await prisma.cleaner.update({
          where: { id: cleaner.id },
          data: {
            topCleanerBadge: true,
            topCleanerUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 dias
            consecutiveFiveStars: 0, // Reset para próximo bônus
            totalBonusEarned: {
              increment: 100.00
            }
          }
        });

        // ✅ Log removido para produção
        return bonus;
      }
    }

    return null;
  } catch (error) {
    // Log removido para produção
    throw error;
  }
}

/**
 * Transfere bônus pendente para conta da faxineira via PIX
 */
async function transferBonus(bonusId) {
  try {
    const bonus = await prisma.cleanerBonus.findUnique({
      where: { id: bonusId },
      include: {
        cleaner: {
          include: { bankDetails: true }
        }
      }
    });

    if (!bonus) {
      throw new Error('Bônus não encontrado');
    }

    const { cleaner, amount } = bonus;
    const bankDetails = cleaner.bankDetails;

    if (!bankDetails) {
      throw new Error('Dados bancários não configurados');
    }

    // Aqui entraria integração com Stripe/MercadoPago para transferir dinheiro
    // Por enquanto, simular transferência bem-sucedida
    const transferred = await simulatePixTransfer(bankDetails, amount);

    if (transferred) {
      await prisma.cleanerBonus.update({
        where: { id: bonusId },
        data: {
          status: 'transferred',
          transferredAt: new Date()
        }
      });

      console.log(`✅ Bônus R$ ${amount} transferido para ${cleaner.name}`);
      return true;
    }

    return false;
  } catch (error) {
    console.error('Erro ao transferir bônus:', error);
    throw error;
  }
}

/**
 * Simula transferência PIX (será substituído por Stripe/MercadoPago real)
 */
async function simulatePixTransfer(bankDetails, amount) {
  try {
    // Validação básica
    if (!bankDetails.pixKey && !bankDetails.accountNumber) {
      throw new Error('PIX ou conta bancária obrigatória');
    }

    // Simular envio
    console.log(`Transferindo R$ ${amount} para ${bankDetails.pixKey || bankDetails.accountNumber}`);
    
    // Delay para simular processamento
    await new Promise(resolve => setTimeout(resolve, 1000));

    return true;
  } catch (error) {
    console.error('Erro na simulação PIX:', error);
    throw error;
  }
}

/**
 * Retorna histórico de bônus da faxineira
 */
async function getBonusHistory(cleanerId) {
  try {
    const bonuses = await prisma.cleanerBonus.findMany({
      where: { cleanerId },
      orderBy: { createdAt: 'desc' }
    });

    return bonuses;
  } catch (error) {
    console.error('Erro ao buscar histórico de bônus:', error);
    throw error;
  }
}

/**
 * Retorna total de bônus ganho pela faxineira
 */
async function getTotalBonusEarned(cleanerId) {
  try {
    const total = await prisma.cleanerBonus.aggregate({
      where: { 
        cleanerId,
        status: 'transferred' // Só contar transferências bem-sucedidas
      },
      _sum: { amount: true }
    });

    return total._sum.amount || 0;
  } catch (error) {
    console.error('Erro ao calcular total de bônus:', error);
    throw error;
  }
}

module.exports = {
  checkAndAwardBonus,
  transferBonus,
  getBonusHistory,
  getTotalBonusEarned
};
