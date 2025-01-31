import React, { useEffect, useState } from 'react';
import { db } from '../../firebase';
import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';
import styles from './SearchReportTemplate.module.css';
import {
  SearchReport,
  Feature,
  Citation,
  Submission
} from '../../types';

interface SearchReportTemplateProps {
  submissionId: string;
}

const SearchReportTemplate: React.FC<SearchReportTemplateProps> = ({ submissionId }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [report, setReport] = useState<SearchReport | null>(null);
  const [newFeature, setNewFeature] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load submission data
        const submissionDoc = await getDoc(doc(db, 'submissions', submissionId));
        if (!submissionDoc.exists()) {
          throw new Error('Submission not found');
        }
        const submissionData = submissionDoc.data() as Submission;
        setSubmission(submissionData);

        // Load or create report
        const reportDoc = await getDoc(doc(db, 'reports', submissionId));
        if (reportDoc.exists()) {
          setReport(reportDoc.data() as SearchReport);
        } else {
          // Create new report if it doesn't exist
          const newReport: SearchReport = {
            id: submissionId,
            submissionId,
            type: submissionData.searchType,
            features: [],
            createdAt: new Date(),
            updatedAt: new Date(),
            createdBy: 'admin', // TODO: Get from auth context
            status: 'draft'
          };
          await setDoc(doc(db, 'reports', submissionId), newReport);
          setReport(newReport);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [submissionId]);

  const addFeature = async () => {
    if (!report || !newFeature.trim()) return;

    const feature: Feature = {
      id: uuidv4(),
      description: newFeature.trim(),
      citations: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const updatedFeatures = [...report.features, feature];
    await updateDoc(doc(db, 'reports', submissionId), {
      features: updatedFeatures,
      updatedAt: serverTimestamp()
    });

    setReport({
      ...report,
      features: updatedFeatures
    });
    setNewFeature('');
  };

  const addCitation = async (featureId: string) => {
    if (!report) return;

    const citation: Citation = {
      id: uuidv4(),
      patentNumber: '',
      relevantText: '',
      analysis: '',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const updatedFeatures = report.features.map(feature => {
      if (feature.id === featureId) {
        return {
          ...feature,
          citations: [...feature.citations, citation]
        };
      }
      return feature;
    });

    await updateDoc(doc(db, 'reports', submissionId), {
      features: updatedFeatures,
      updatedAt: serverTimestamp()
    });

    setReport({
      ...report,
      features: updatedFeatures
    });
  };

  const updateCitation = async (
    featureId: string,
    citationId: string,
    updates: Partial<Citation>
  ) => {
    if (!report) return;

    const updatedFeatures = report.features.map(feature => {
      if (feature.id === featureId) {
        const updatedCitations = feature.citations.map(citation => {
          if (citation.id === citationId) {
            return {
              ...citation,
              ...updates,
              updatedAt: new Date()
            };
          }
          return citation;
        });
        return {
          ...feature,
          citations: updatedCitations
        };
      }
      return feature;
    });

    await updateDoc(doc(db, 'reports', submissionId), {
      features: updatedFeatures,
      updatedAt: serverTimestamp()
    });

    setReport({
      ...report,
      features: updatedFeatures
    });
  };

  const updateReport = async (updates: Partial<SearchReport>) => {
    if (!report) return;

    await updateDoc(doc(db, 'reports', submissionId), {
      ...updates,
      updatedAt: serverTimestamp()
    });

    setReport({
      ...report,
      ...updates
    });
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!submission || !report) return <div>No data available</div>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>{submission.projectName}</h1>
        <span className={`${styles.statusBadge} ${styles[report.status]}`}>
          {report.status.toUpperCase()}
        </span>
      </div>

      <div className={styles.projectInfo}>
        <p>Reference Number: {submission.referenceNumber}</p>
        <p>Search Type: {submission.searchType.toUpperCase()}</p>
        <p>Invention Title: {submission.inventionTitle}</p>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Executive Summary</h2>
        <textarea
          className={styles.textArea}
          value={report.executiveSummary || ''}
          onChange={(e) => updateReport({ executiveSummary: e.target.value })}
          placeholder="Enter executive summary..."
        />
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Features</h2>
        <div className={styles.featuresList}>
          {report.features.map((feature) => (
            <div key={feature.id} className={styles.feature}>
              <h3>{feature.description}</h3>
              <div className={styles.citations}>
                {feature.citations.map((citation) => (
                  <div key={citation.id} className={styles.citation}>
                    <input
                      type="text"
                      value={citation.patentNumber}
                      onChange={(e) =>
                        updateCitation(feature.id, citation.id, {
                          patentNumber: e.target.value
                        })
                      }
                      placeholder="Patent number"
                    />
                    <textarea
                      value={citation.relevantText}
                      onChange={(e) =>
                        updateCitation(feature.id, citation.id, {
                          relevantText: e.target.value
                        })
                      }
                      placeholder="Relevant text from patent"
                    />
                    <textarea
                      value={citation.analysis}
                      onChange={(e) =>
                        updateCitation(feature.id, citation.id, {
                          analysis: e.target.value
                        })
                      }
                      placeholder="Analysis"
                    />
                  </div>
                ))}
                <button
                  className={styles.secondaryButton}
                  onClick={() => addCitation(feature.id)}
                >
                  Add Citation
                </button>
              </div>
            </div>
          ))}
        </div>
        <div>
          <input
            type="text"
            value={newFeature}
            onChange={(e) => setNewFeature(e.target.value)}
            placeholder="Enter new feature description"
          />
          <button
            className={styles.primaryButton}
            onClick={addFeature}
          >
            Add Feature
          </button>
        </div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Recommendations</h2>
        <textarea
          className={styles.textArea}
          value={report.recommendations || ''}
          onChange={(e) => updateReport({ recommendations: e.target.value })}
          placeholder="Enter recommendations..."
        />
      </div>

      <div className={styles.actions}>
        <button
          className={styles.secondaryButton}
          onClick={() => updateReport({ status: 'review' })}
        >
          Submit for Review
        </button>
        <button
          className={styles.primaryButton}
          onClick={() => updateReport({ status: 'final' })}
        >
          Finalize Report
        </button>
      </div>
    </div>
  );
};

export default SearchReportTemplate;
