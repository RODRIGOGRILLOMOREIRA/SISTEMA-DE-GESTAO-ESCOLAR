/**
 * Seed de Permissões e Roles - RBAC Granular
 * Sistema de Gestão Escolar - Fase 4
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Definição de recursos e ações
const RESOURCES = [
  'alunos',
  'professores',
  'funcionarios',
  'equipe_diretiva',
  'turmas',
  'disciplinas',
  'notas',
  'frequencias',
  'matriculas',
  'calendario',
  'configuracoes',
  'grade_horaria',
  'notificacoes',
  'relatorios',
  'audit',
  'backup',
  'users',
  'roles',
  'permissions',
  'communication', // FASE 5: Central de Comunicação
];

const ACTIONS = ['create', 'read', 'update', 'delete', 'list', 'export'];

async function seedPermissions() {
  console.log('🔐 Criando permissões...');

  const permissions = [];

  // Criar permissões para cada recurso + ação
  for (const resource of RESOURCES) {
    for (const action of ACTIONS) {
      permissions.push({
        name: `${resource}.${action}`,
        description: `Permissão para ${action} em ${resource}`,
        resource,
        action,
      });
    }
  }

  // Criar permissões especiais
  permissions.push(
    {
      name: 'system.admin',
      description: 'Acesso total ao sistema',
      resource: 'system',
      action: 'admin',
    },
    {
      name: 'turmas.manage_students',
      description: 'Gerenciar alunos de uma turma',
      resource: 'turmas',
      action: 'manage',
    },
    {
      name: 'notas.manage_own',
      description: 'Gerenciar apenas suas próprias notas',
      resource: 'notas',
      action: 'manage_own',
    },
    {
      name: 'frequencias.manage_own',
      description: 'Gerenciar apenas suas próprias frequências',
      resource: 'frequencias',
      action: 'manage_own',
    },
    // FASE 5: Permissões específicas de comunicação
    {
      name: 'communication:send',
      description: 'Enviar mensagens através da central de comunicação',
      resource: 'communication',
      action: 'send',
    },
    {
      name: 'communication:view',
      description: 'Visualizar histórico e analytics de comunicação',
      resource: 'communication',
      action: 'view',
    },
    {
      name: 'communication:manage',
      description: 'Gerenciar templates e agendamentos',
      resource: 'communication',
      action: 'manage',
    },
    {
      name: 'communication:configure',
      description: 'Configurar canais de comunicação (API keys, etc)',
      resource: 'communication',
      action: 'configure',
    }
  );

  // Inserir permissões (ignorar duplicatas)
  for (const permission of permissions) {
    await prisma.permission.upsert({
      where: { name: permission.name },
      update: {},
      create: permission,
    });
  }

  console.log(`✅ ${permissions.length} permissões criadas`);
}

async function seedRoles() {
  console.log('👥 Criando roles...');

  // Role: SUPER_ADMIN (nível 100)
  const superAdminRole = await prisma.role.upsert({
    where: { name: 'SUPER_ADMIN' },
    update: {},
    create: {
      name: 'SUPER_ADMIN',
      description: 'Super Administrador com acesso total',
      level: 100,
      isSystem: true,
    },
  });

  // Role: ADMIN (nível 90)
  const adminRole = await prisma.role.upsert({
    where: { name: 'ADMIN' },
    update: {},
    create: {
      name: 'ADMIN',
      description: 'Administrador do sistema',
      level: 90,
      isSystem: true,
    },
  });

  // Role: COORDENADOR (nível 70)
  const coordenadorRole = await prisma.role.upsert({
    where: { name: 'COORDENADOR' },
    update: {},
    create: {
      name: 'COORDENADOR',
      description: 'Coordenador Pedagógico',
      level: 70,
      isSystem: true,
    },
  });

  // Role: PROFESSOR (nível 50)
  const professorRole = await prisma.role.upsert({
    where: { name: 'PROFESSOR' },
    update: {},
    create: {
      name: 'PROFESSOR',
      description: 'Professor',
      level: 50,
      isSystem: true,
    },
  });

  // Role: SECRETARIA (nível 60)
  const secretariaRole = await prisma.role.upsert({
    where: { name: 'SECRETARIA' },
    update: {},
    create: {
      name: 'SECRETARIA',
      description: 'Secretária/Funcionário Administrativo',
      level: 60,
      isSystem: true,
    },
  });

  // Role: ALUNO (nível 10)
  const alunoRole = await prisma.role.upsert({
    where: { name: 'ALUNO' },
    update: {},
    create: {
      name: 'ALUNO',
      description: 'Aluno',
      level: 10,
      isSystem: true,
    },
  });

  console.log('✅ 6 roles criadas');

  return {
    superAdminRole,
    adminRole,
    coordenadorRole,
    professorRole,
    secretariaRole,
    alunoRole,
  };
}

async function assignPermissionsToRoles(roles: any) {
  console.log('🔗 Associando permissões às roles...');

  const allPermissions = await prisma.permission.findMany();

  // SUPER_ADMIN: Todas as permissões
  for (const permission of allPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: roles.superAdminRole.id,
          permissionId: permission.id,
        },
      },
      update: {},
      create: {
        roleId: roles.superAdminRole.id,
        permissionId: permission.id,
      },
    });
  }
  console.log('  ✅ SUPER_ADMIN: Todas as permissões');

  // ADMIN: Quase todas, exceto system.admin
  const adminPermissions = allPermissions.filter((p) => p.name !== 'system.admin');
  for (const permission of adminPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: roles.adminRole.id,
          permissionId: permission.id,
        },
      },
      update: {},
      create: {
        roleId: roles.adminRole.id,
        permissionId: permission.id,
      },
    });
  }
  console.log('  ✅ ADMIN: Permissões administrativas');

  // COORDENADOR: Gestão pedagógica
  const coordenadorResources = [
    'alunos',
    'professores',
    'turmas',
    'disciplinas',
    'notas',
    'frequencias',
    'calendario',
    'grade_horaria',
    'relatorios',
  ];
  const coordenadorPermissions = allPermissions.filter((p) =>
    coordenadorResources.includes(p.resource)
  );
  for (const permission of coordenadorPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: roles.coordenadorRole.id,
          permissionId: permission.id,
        },
      },
      update: {},
      create: {
        roleId: roles.coordenadorRole.id,
        permissionId: permission.id,
      },
    });
  }
  console.log('  ✅ COORDENADOR: Permissões pedagógicas');

  // PROFESSOR: Apenas suas turmas, notas e frequências
  const professorResources = ['alunos.read', 'alunos.list', 'turmas.read', 'turmas.list'];
  const professorOwnPermissions = ['notas.manage_own', 'frequencias.manage_own'];

  const professorPermissions = allPermissions.filter(
    (p) =>
      professorResources.includes(p.name) ||
      professorOwnPermissions.includes(p.name) ||
      (p.resource === 'notas' && ['create', 'read', 'update', 'list'].includes(p.action)) ||
      (p.resource === 'frequencias' && ['create', 'read', 'update', 'list'].includes(p.action))
  );

  for (const permission of professorPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: roles.professorRole.id,
          permissionId: permission.id,
        },
      },
      update: {},
      create: {
        roleId: roles.professorRole.id,
        permissionId: permission.id,
      },
    });
  }
  console.log('  ✅ PROFESSOR: Permissões de ensino');

  // SECRETARIA: Matrícula e gestão de alunos
  const secretariaResources = [
    'alunos',
    'turmas',
    'matriculas',
    'funcionarios',
    'equipe_diretiva',
  ];
  const secretariaPermissions = allPermissions.filter(
    (p) => secretariaResources.includes(p.resource) && p.action !== 'delete'
  );
  for (const permission of secretariaPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: roles.secretariaRole.id,
          permissionId: permission.id,
        },
      },
      update: {},
      create: {
        roleId: roles.secretariaRole.id,
        permissionId: permission.id,
      },
    });
  }
  console.log('  ✅ SECRETARIA: Permissões administrativas');

  // ALUNO: Apenas leitura de suas próprias notas e frequências
  const alunoPermissions = allPermissions.filter(
    (p) =>
      (p.resource === 'notas' && p.action === 'read') ||
      (p.resource === 'frequencias' && p.action === 'read') ||
      (p.resource === 'turmas' && p.action === 'read')
  );
  for (const permission of alunoPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: roles.alunoRole.id,
          permissionId: permission.id,
        },
      },
      update: {},
      create: {
        roleId: roles.alunoRole.id,
        permissionId: permission.id,
      },
    });
  }
  console.log('  ✅ ALUNO: Permissões de visualização');
}

async function main() {
  console.log('🌱 Iniciando seed de RBAC...\n');

  try {
    await seedPermissions();
    const roles = await seedRoles();
    await assignPermissionsToRoles(roles);

    console.log('\n✅ Seed de RBAC concluído com sucesso!');
    console.log('\n📊 Resumo:');
    console.log(`  • Permissões criadas: ${await prisma.permission.count()}`);
    console.log(`  • Roles criadas: ${await prisma.role.count()}`);
    console.log(`  • Associações criadas: ${await prisma.rolePermission.count()}`);
  } catch (error) {
    console.error('❌ Erro ao executar seed:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
