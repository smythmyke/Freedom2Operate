import { SearchReport, RiskLevel } from '../types';

const currentDate = new Date();
const twentyYearsAgo = new Date();
twentyYearsAgo.setFullYear(currentDate.getFullYear() - 20);

export const sampleReport: SearchReport = {
  id: 'sample-report-001',
  submissionId: 'sample-submission-001',
  type: 'fto',
  status: 'final',
  createdAt: twentyYearsAgo,
  updatedAt: currentDate,
  createdBy: 'admin',
  examiner: {
    name: 'John Smith',
    title: 'Senior Patent Analyst',
    qualifications: ['USPTO Registered Patent Agent', 'M.S. Computer Science']
  },
  clientReference: 'CLIENT-2025-001',
  searchDate: currentDate,

  executiveSummary: {
    text: `This Freedom to Operate (FTO) search report analyzes the patentability and potential infringement risks associated with the proposed smart irrigation control system. The search covered major patent jurisdictions including US, EP, CN, and JP for the past 20 years.

Based on our comprehensive analysis, we identified several relevant patents that warrant careful consideration, particularly in the areas of soil moisture sensing and automated watering schedule optimization. While there are some potential risks, we believe there are viable design-around opportunities and technical alternatives that could mitigate these concerns.`,
    keyFindings: [
      'High-risk area identified in ML-based optimization algorithms',
      'Medium-risk concerns in wireless sensor network protocols',
      'Low-risk assessment for mobile interface implementation',
      'Multiple viable design-around opportunities identified',
      'Active patent landscape with fragmented ownership'
    ],
    riskSummary: {
      overall: 'Medium' as RiskLevel,
      byFeature: {
        'Wireless soil moisture sensor network': 'Medium' as RiskLevel,
        'Machine learning-based watering schedule optimization': 'High' as RiskLevel,
        'Mobile app control interface': 'Low' as RiskLevel
      }
    }
  },
  
  features: [
    {
      id: 'feature-001',
      description: 'Wireless soil moisture sensor network',
      citations: [
        {
          id: 'citation-001',
          patentNumber: 'US9743596B2',
          relevantText: 'A system for monitoring soil conditions comprising a network of wireless sensors that measure moisture content and transmit data to a central hub.',
          analysis: 'Claims cover basic wireless moisture sensing network but use different communication protocol. Consider alternative protocols or sensor arrangements.',
          publicationDate: new Date('2017-08-29'),
          priorityDate: new Date('2015-12-15'),
          patentFamily: ['EP3188537B1', 'CN107079600A'],
          legalStatus: 'Active',
          assignee: 'AgriTech Solutions Inc.',
          claimsReferenced: ['1', '5', '8'],
          figuresReferenced: ['FIG. 2', 'FIG. 3'],
          riskLevel: 'Medium' as RiskLevel,
          createdAt: twentyYearsAgo,
          updatedAt: currentDate,
        }
      ],
      riskSummary: {
        overallRisk: 'Medium' as RiskLevel,
        keyRisks: [
          'Communication protocol overlap with US9743596B2',
          'Sensor network topology similarities'
        ],
        mitigationStrategies: [
          'Implement alternative communication protocols',
          'Design different sensor placement patterns',
          'Consider mesh network topology'
        ]
      },
      createdAt: twentyYearsAgo,
      updatedAt: currentDate,
    },
    {
      id: 'feature-002',
      description: 'Machine learning-based watering schedule optimization',
      citations: [
        {
          id: 'citation-002',
          patentNumber: 'US10506769B2',
          relevantText: 'Method for optimizing irrigation schedules using machine learning algorithms that analyze historical weather data and soil conditions.',
          analysis: 'High risk due to specific claims covering ML-based optimization using similar parameters. Consider using rule-based optimization or different input parameters.',
          publicationDate: new Date('2019-12-17'),
          priorityDate: new Date('2018-06-22'),
          patentFamily: ['EP3838071A1'],
          legalStatus: 'Active',
          assignee: 'Smart Garden Technologies Ltd.',
          claimsReferenced: ['1', '4', '12'],
          figuresReferenced: ['FIG. 1', 'FIG. 4'],
          riskLevel: 'High' as RiskLevel,
          createdAt: twentyYearsAgo,
          updatedAt: currentDate,
        }
      ],
      riskSummary: {
        overallRisk: 'High' as RiskLevel,
        keyRisks: [
          'ML algorithm parameter overlap',
          'Similar optimization approach'
        ],
        mitigationStrategies: [
          'Redesign ML algorithm with different parameters',
          'Consider hybrid approach with rule-based system',
          'Explore licensing options'
        ]
      },
      createdAt: twentyYearsAgo,
      updatedAt: currentDate,
    },
    {
      id: 'feature-003',
      description: 'Mobile app control interface',
      citations: [
        {
          id: 'citation-003',
          patentNumber: 'US9297839B1',
          relevantText: 'Mobile application interface for controlling irrigation systems including schedule management and real-time monitoring.',
          analysis: 'Low risk as claims are focused on specific UI elements not present in our implementation.',
          publicationDate: new Date('2016-03-29'),
          priorityDate: new Date('2014-07-10'),
          patentFamily: ['EP2975897B1'],
          legalStatus: 'Active',
          assignee: 'GreenTech Solutions',
          claimsReferenced: ['15', '16'],
          figuresReferenced: ['FIG. 6'],
          riskLevel: 'Low' as RiskLevel,
          createdAt: twentyYearsAgo,
          updatedAt: currentDate,
        }
      ],
      riskSummary: {
        overallRisk: 'Low' as RiskLevel,
        keyRisks: [
          'Minor UI element similarities'
        ],
        mitigationStrategies: [
          'Document UI differences',
          'Maintain current implementation approach'
        ]
      },
      createdAt: twentyYearsAgo,
      updatedAt: currentDate,
    }
  ],

  considerations: `Based on our analysis, the following points warrant consideration:

1. Wireless Sensor Network:
   - Alternative communication protocols not covered by US9743596B2
   - Different sensor placement patterns
   - Mesh network topologies

2. ML-based Optimization:
   - Potential redesign of ML optimization algorithm with different input parameters
   - Hybrid approach combining rule-based and ML methods
   - Possible licensing opportunities with Smart Garden Technologies Ltd.

3. Mobile Interface:
   - Current design appears to have low overlap with existing patents
   - Document UI differences from US9297839B1
   - Continue monitoring for new relevant filings`,

  methodology: 'Comprehensive patent search using commercial databases and patent office resources. Analysis focused on active patents and applications in major markets.',
  
  searchStrategy: `Keywords: irrigation control, soil moisture sensing, wireless sensor network, machine learning irrigation

Classifications:
- A01G25/16: Control of watering - Automatic watering devices, e.g. for flower pots
- G05B19/042: Programme-control systems - Using digital processors
- G06N20/00: Machine learning - Methods and systems for machine learning`,
  
  searchScope: {
    geographic: ['US', 'EP', 'CN', 'JP'],
    temporalRange: {
      startDate: twentyYearsAgo,
      endDate: currentDate,
    },
    classifications: [
      {
        code: 'A01G25/16',
        definition: 'Control of watering - Automatic watering devices, e.g. for flower pots'
      },
      {
        code: 'G05B19/042',
        definition: 'Programme-control systems - Using digital processors'
      },
      {
        code: 'G06N20/00',
        definition: 'Machine learning - Methods and systems for machine learning'
      }
    ],
  },

  marketAnalysis: {
    keyPatentHolders: [
      {
        name: 'AgriTech Solutions Inc.',
        patentCount: 15,
        relevantPortfolio: ['US9743596B2', 'US9668431B2'],
        businessOverview: 'Leading provider of agricultural IoT solutions',
        patentingStrategy: 'Focus on sensor network and data collection technologies',
        geographicCoverage: ['US', 'EP', 'CN']
      },
      {
        name: 'Smart Garden Technologies Ltd.',
        patentCount: 8,
        relevantPortfolio: ['US10506769B2'],
        businessOverview: 'AI-focused irrigation control systems',
        patentingStrategy: 'Heavy emphasis on ML/AI applications',
        geographicCoverage: ['US', 'EP']
      }
    ],
    competitiveLandscape: 'Market shows moderate patent activity with focus on AI/ML applications. Several major players but fragmented ownership.',
    technologyTrends: [
      {
        trend: 'AI/ML Integration',
        description: 'Increasing focus on machine learning for optimization',
        keyPlayers: ['Smart Garden Technologies', 'AgriTech Solutions'],
        patentActivity: 'High growth in last 5 years'
      },
      {
        trend: 'IoT Sensor Networks',
        description: 'Evolution towards mesh networks and advanced protocols',
        keyPlayers: ['AgriTech Solutions', 'GreenTech Solutions'],
        patentActivity: 'Steady growth'
      }
    ]
  },

  technologyLandscape: {
    overview: 'The smart irrigation control system market is rapidly evolving with increasing focus on AI/ML integration and IoT connectivity.',
    trends: [
      'Shift towards edge computing for sensor processing',
      'Integration of weather forecast data',
      'Advanced ML model optimization',
      'Mesh network topologies'
    ],
    emergingTechnologies: [
      'Edge AI for real-time processing',
      'Advanced sensor fusion techniques',
      'Blockchain for data integrity'
    ]
  },

  searchDocumentation: {
    databases: [
      {
        name: 'USPTO',
        coverageDates: {
          start: twentyYearsAgo,
          end: currentDate
        }
      },
      {
        name: 'EPO',
        coverageDates: {
          start: twentyYearsAgo,
          end: currentDate
        }
      },
      {
        name: 'Lens.org',
        coverageDates: {
          start: twentyYearsAgo,
          end: currentDate
        },
        limitations: ['Some full-text limitations for non-English patents']
      }
    ],
    searchQueries: [
      {
        iteration: 1,
        query: '(irrigation OR watering) AND (control OR system) AND (wireless OR remote) AND sensor*',
        database: 'USPTO',
        resultCount: 856,
        date: currentDate,
        refinementReason: 'Initial broad search',
        relevantResults: 120
      },
      {
        iteration: 2,
        query: 'title:(irrigation control) AND claims:(machine learning OR artificial intelligence) AND classification_cpc:A01G25/16',
        database: 'Lens.org',
        resultCount: 234,
        date: currentDate,
        refinementReason: 'Focus on ML/AI aspects',
        relevantResults: 45
      },
      {
        iteration: 3,
        query: 'classification:(G05B19/042 OR G06N20/00) AND abstract:(irrigation sensor network)',
        database: 'Lens.org',
        resultCount: 167,
        date: currentDate,
        refinementReason: 'Targeted classification search',
        relevantResults: 32
      },
      {
        iteration: 4,
        query: 'irrigation system soil moisture sensor wireless',
        database: 'Google Patents',
        resultCount: 452,
        date: currentDate,
        refinementReason: 'Sensor network focus',
        relevantResults: 89
      },
      {
        iteration: 5,
        query: 'machine learning irrigation optimization',
        database: 'Google Patents',
        resultCount: 312,
        date: currentDate,
        refinementReason: 'ML optimization focus',
        relevantResults: 67
      }
    ],
    searchStrategy: {
      keywords: [
        'irrigation control',
        'soil moisture sensing',
        'wireless sensor network',
        'machine learning irrigation'
      ],
      classifications: [
        {
          code: 'A01G25/16',
          definition: 'Control of watering - Automatic watering devices'
        },
        {
          code: 'G05B19/042',
          definition: 'Programme-control systems - Using digital processors'
        },
        {
          code: 'G06N20/00',
          definition: 'Machine learning - Methods and systems for machine learning'
        }
      ],
      iterations: []
    },
    totalResultsReviewed: 2021,
  },

  riskMitigationStrategies: [
    {
      feature: 'Wireless soil moisture sensor network',
      riskLevel: 'Medium' as RiskLevel,
      description: 'Risk from overlapping communication protocols',
      proposedSolutions: [
        'Implement proprietary protocol',
        'Use different network topology',
        'Modify sensor placement strategy'
      ],
      technicalFeasibility: 'High'
    },
    {
      feature: 'Machine learning-based optimization',
      riskLevel: 'High' as RiskLevel,
      description: 'Significant overlap with existing ML patents',
      proposedSolutions: [
        'Develop hybrid ML/rule-based system',
        'Use different input parameters',
        'Explore licensing options'
      ],
      estimatedCost: 'Medium to High',
      timelineEstimate: '4-6 months',
      technicalFeasibility: 'Medium'
    }
  ],

  legalDisclaimers: {
    scopeLimitations: [
      'Search limited to published patents and applications',
      'Analysis based on public information only',
      'Market conditions subject to change'
    ],
    assumptions: [
      'All cited patents are valid and enforceable',
      'No material changes to product design'
    ],
    legalCounselRecommendations: 'Consult with patent counsel before proceeding with high-risk features. Consider formal FTO opinion for final design.',
    jurisdictionSpecifics: {
      'US': 'Consider IPR options for key blocking patents',
      'EP': 'National validations may affect enforcement',
      'CN': 'Rapid patent office reforms affecting examination'
    }
  },

  appendices: {
    fullPatentList: [
      'US9743596B2',
      'US10506769B2',
      'US9297839B1',
      'EP3188537B1',
      'EP3838071A1',
      'EP2975897B1'
    ],
    claimCharts: [
      {
        patentNumber: 'US10506769B2',
        claims: {
          '1': {
            text: 'A method for optimizing irrigation schedules using machine learning...',
            analysis: 'Direct overlap with ML optimization approach',
            riskLevel: 'High' as RiskLevel
          },
          '4': {
            text: 'The method of claim 1, wherein the input parameters include soil moisture data...',
            analysis: 'Similar parameter usage but potential differences',
            riskLevel: 'Medium' as RiskLevel
          }
        }
      }
    ],
    searchIterationDetails: []
  },
};

export default sampleReport;
