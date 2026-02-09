import swaggerJsdoc from 'swagger-jsdoc';

/**
 * Configuração do Swagger/OpenAPI 3.0
 * @description Define especificação da API para documentação automática
 */
const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Sistema de Gestão Escolar - API',
      version: '1.0.0',
      description: `
        API REST completa para gestão escolar com funcionalidades de:
        - Autenticação JWT com refresh tokens
        - Gerenciamento de usuários (RBAC com 8 papéis)
        - Gestão de alunos, turmas, disciplinas
        - Notas e frequências
        - Comunicação (notificações, mensagens)
        - Predição de evasão escolar (AI)
        - Reconhecimento facial para ponto
        - Backup e restauração de dados
      `,
      contact: {
        name: 'Equipe de Desenvolvimento',
        email: 'dev@escolaexemplo.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Servidor de Desenvolvimento'
      },
      {
        url: 'http://localhost:3000/api',
        description: 'Base API'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Token JWT obtido no endpoint /api/auth/login'
        }
      },
      schemas: {
        // Schema de erro padrão
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: 'Mensagem de erro'
            },
            details: {
              type: 'string',
              description: 'Detalhes adicionais do erro'
            }
          }
        },
        // Schema de usuário
        Usuario: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'ID único do usuário'
            },
            nome: {
              type: 'string',
              description: 'Nome completo do usuário'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Email do usuário'
            },
            role: {
              type: 'string',
              enum: ['ADMIN', 'DIRETOR', 'COORDENADOR', 'PROFESSOR', 'SECRETARIO', 'ALUNO', 'RESPONSAVEL', 'VISITANTE'],
              description: 'Papel/permissão do usuário no sistema'
            },
            ativo: {
              type: 'boolean',
              description: 'Se o usuário está ativo'
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        // Schema de resposta de login
        LoginResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean'
            },
            token: {
              type: 'string',
              description: 'Token JWT para autenticação'
            },
            refreshToken: {
              type: 'string',
              description: 'Token para renovar o JWT'
            },
            user: {
              $ref: '#/components/schemas/Usuario'
            }
          }
        },
        // Schema de aluno
        Aluno: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid'
            },
            nome: {
              type: 'string'
            },
            matricula: {
              type: 'string',
              description: 'Número de matrícula único'
            },
            dataNascimento: {
              type: 'string',
              format: 'date'
            },
            turmaId: {
              type: 'string',
              format: 'uuid'
            },
            turma: {
              type: 'object',
              description: 'Dados da turma do aluno'
            },
            ativo: {
              type: 'boolean'
            }
          }
        },
        // Schema de configurações
        Configuracoes: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid'
            },
            nomeEscola: {
              type: 'string',
              description: 'Nome da escola'
            },
            redeEscolar: {
              type: 'string',
              nullable: true,
              description: 'Rede de ensino (Municipal, Estadual, etc.)'
            },
            endereco: {
              type: 'string',
              description: 'Endereço completo da escola'
            },
            telefone: {
              type: 'string',
              nullable: true
            },
            email: {
              type: 'string',
              format: 'email',
              nullable: true
            },
            logoUrl: {
              type: 'string',
              format: 'uri',
              nullable: true
            },
            temaModo: {
              type: 'string',
              enum: ['light', 'dark'],
              description: 'Tema da interface'
            }
          }
        },
        // Schema de resultado paginado
        PaginatedResult: {
          type: 'object',
          properties: {
            data: {
              type: 'array',
              items: {},
              description: 'Array de itens da página atual'
            },
            meta: {
              type: 'object',
              properties: {
                total: {
                  type: 'integer',
                  description: 'Total de itens'
                },
                page: {
                  type: 'integer',
                  description: 'Página atual'
                },
                perPage: {
                  type: 'integer',
                  description: 'Itens por página'
                },
                totalPages: {
                  type: 'integer',
                  description: 'Total de páginas'
                }
              }
            }
          }
        }
      }
    },
    // Segurança global (JWT)
    security: [
      {
        bearerAuth: []
      }
    ],
    // Tags para organizar endpoints
    tags: [
      {
        name: 'Auth',
        description: 'Autenticação e autorização'
      },
      {
        name: 'Usuários',
        description: 'Gerenciamento de usuários'
      },
      {
        name: 'Alunos',
        description: 'Gestão de alunos'
      },
      {
        name: 'Turmas',
        description: 'Gestão de turmas e matrículas'
      },
      {
        name: 'Disciplinas',
        description: 'Disciplinas e currículos'
      },
      {
        name: 'Notas',
        description: 'Lançamento e consulta de notas'
      },
      {
        name: 'Frequências',
        description: 'Controle de presença'
      },
      {
        name: 'Comunicação',
        description: 'Notificações e mensagens'
      },
      {
        name: 'Predição',
        description: 'Análise de risco de evasão'
      },
      {
        name: 'Configurações',
        description: 'Configurações gerais da escola'
      },
      {
        name: 'Backup',
        description: 'Backup e restauração do banco de dados'
      }
    ]
  },
  // Arquivos com anotações JSDoc/Swagger
  apis: [
    './src/routes/*.ts',
    './src/routes/*.js',
    './src/controllers/*.ts',
    './src/server.ts'
  ]
};

export const swaggerSpec = swaggerJsdoc(options);
