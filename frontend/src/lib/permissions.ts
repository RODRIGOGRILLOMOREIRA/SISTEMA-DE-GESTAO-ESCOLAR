import { Usuario } from './api';

/**
 * Verifica se o usuário é administrador (Diretor, Vice-Diretor, Supervisor ou Orientador)
 */
export const isAdmin = (user: Usuario | null): boolean => {
  if (!user || !user.cargo) return false;
  
  const cargo = user.cargo.toLowerCase();
  return cargo.includes('diretor') || 
         cargo.includes('vice') || 
         cargo.includes('supervisor') || 
         cargo.includes('orientador');
};

/**
 * Verifica se o usuário tem permissão de diretor
 */
export const isDiretor = (user: Usuario | null): boolean => {
  if (!user || !user.cargo) return false;
  
  const cargo = user.cargo.toLowerCase();
  return cargo.includes('diretor') && !cargo.includes('vice');
};

/**
 * Verifica se o usuário tem permissão de vice-diretor
 */
export const isViceDiretor = (user: Usuario | null): boolean => {
  if (!user || !user.cargo) return false;
  
  const cargo = user.cargo.toLowerCase();
  return cargo.includes('vice') && cargo.includes('diretor');
};

/**
 * Verifica se o usuário é supervisor
 */
export const isSupervisor = (user: Usuario | null): boolean => {
  if (!user || !user.cargo) return false;
  
  const cargo = user.cargo.toLowerCase();
  return cargo.includes('supervisor');
};

/**
 * Verifica se o usuário é orientador
 */
export const isOrientador = (user: Usuario | null): boolean => {
  if (!user || !user.cargo) return false;
  
  const cargo = user.cargo.toLowerCase();
  return cargo.includes('orientador');
};

/**
 * Verifica se o usuário é professor
 */
export const isProfessor = (user: Usuario | null): boolean => {
  if (!user || !user.cargo) return false;
  
  const cargo = user.cargo.toLowerCase();
  return cargo.includes('professor');
};

/**
 * Verifica se o usuário é coordenador
 */
export const isCoordenador = (user: Usuario | null): boolean => {
  if (!user || !user.cargo) return false;
  
  const cargo = user.cargo.toLowerCase();
  return cargo.includes('coordenador');
};

/**
 * Obtém o cargo formatado do usuário
 */
export const getCargoFormatado = (user: Usuario | null): string => {
  if (!user || !user.cargo) return 'Usuário';
  return user.cargo;
};
