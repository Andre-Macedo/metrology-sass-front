# 05. Padrões de Backend (Modular ERP)

Este documento define os padrões arquiteturais do backend Laravel do MetroLab para suportar o crescimento como um ERP Industrial.

## 1. Arquitetura Modular

O sistema utiliza o padrão de módulos para isolar domínios de negócio.
- **Módulo Core/System:** Contém as entidades que atravessam todo o ERP (Usuários, Estações, Fornecedores).
- **Módulos de Domínio:** Funcionalidades específicas (Metrologia, Qualidade, IoT).

### Estrutura de um Módulo
```text
Modules/
└── {NomeDoModulo}/
    ├── app/
    │   ├── Actions/                 # Lógica de negócio orquestrada (Service Layer)
    │   ├── DTOs/                    # Data Transfer Objects estritamente tipados
    │   ├── Enums/                   # Tipos enumerados de estado e classificação
    │   ├── Http/
    │   │   ├── Controllers/Api/V1/  # Versionamento de API
    │   │   └── Resources/           # Padronização de saídas JsonResource
    │   ├── Models/                  # Modelos Eloquent de domínio
    │   ├── Services/                # Motores de cálculo matemáticos e regras normativas
    │   └── Providers/               # Injeção de dependência e registro do módulo
    ├── database/
    │   ├── migrations/              # Migrações isoladas do módulo
    │   ├── seeders/                 # Seeders de dados iniciais
    │   └── factories/               # Model factories para testes
    └── routes/
        └── api.php                  # Definição de endpoints REST
```

## 2. Padrão de API (V1)

Todas as novas rotas devem ser versionadas em `/api/v1/...`.

1.  **Controllers:** Devem ser magros (Skinny Controllers). A lógica complexa deve morar em **Actions**.
2.  **API Resources:** Nunca retorne um Model diretamente. Use sempre um `JsonResource` para garantir que mudanças no banco não quebrem o frontend.
3.  **Namespaces:** Evite o uso de `App\Models`. Use sempre o namespace do módulo correspondente (`Modules\{Modulo}\Models\{Model}`).

## 3. Lógica de Negócio (Actions)

Para operações que envolvam mais do que um simples CRUD, crie uma **Action**.
- *Exemplo:* `SubmitInstrumentChecklistAction`, `CalculateUncertaintyAction`.
- Benefícios: Facilita testes unitários e permite reutilização da lógica em comandos CLI ou Jobs.

## 4. Banco de Dados e Factories

- Factories de módulos devem morar em `Modules/{Modulo}/database/factories`.
- O método `protected static function newFactory()` deve ser implementado no Model para que o Laravel encontre a factory corretamente.

---
*Nota: Este padrão deve ser seguido ao criar novos módulos como 'QualityControl' ou 'Production'.*
