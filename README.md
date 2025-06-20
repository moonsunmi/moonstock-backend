## 분할 매매 추적기 - Split Trade Tracker
개인 투자자의 실전 매매 기록에 최적화된 분할 매매 추적 시스템

### ✨ 프로젝트 개요
일반적인 주식 앱은 단순한 매수·매도 기록만 제공하고,
분할 매매나 전략적 트레이딩 흐름을 기록·회고하는 데는 한계가 있습니다.

이 프로젝트는 실제 투자자가 사용하는 분할 매수/분할 매도 전략과
그에 따른 수익 실현 흐름을 스스로 매칭하고 추적할 수 있도록 설계된
수동 매칭 기반의 실전 투자 기록 시스템입니다.

### 💡 핵심 기능
1. 매매 내역 수동 입력
매수(BUY) / 매도(SELL) 거래를 수동으로 기록

거래 단위: 주식 티커, 수량, 가격, 날짜, 수수료 및 세금 등

2. 매칭 시스템
사용자는 거래들을 직접 1:N / N:1로 매칭할 수 있음

매도 → 매수 순서의 역순 매칭도 허용 (선매도 후매수 전략)

매칭된 거래 간의 수익, 세금, 수수료를 기준으로 순수익(netProfit) 계산

3. 잔여 수량 관리
매매마다 unmatchedQty(미매칭 수량)를 자동 추적

하나의 매수 내역이 여러 매도에 연결될 수 있고, 반대도 가능

4. 매칭 수정 기능
기존 매칭을 언제든지 해제 및 재지정 가능

예: 4월 2일 매도 ↔ 4월 3일 매수 매칭 → 4월 4일 매도로 변경 가능

5. 계좌별 수수료, 종목별 세율 관리
거래 당시 계좌의 수수료율, 종목의 세율을 기록해 정확한 수익 계산

향후 환율 기능 추가 가능 (다통화 지원 설계 고려 중)

### 📊 예시 시나리오
[4/1] 매수 300원 × 1000주  
[4/2] 매도 200원 × 200주  
[4/3] 매수 100원 × 200주  

=> 유저는 "4/2 매도"와 "4/3 매수"를 한 쌍으로 매칭  
=> 200주 기준 매칭 수익 계산됨  

### 🔄 사용 목적
단순한 과거 기록이 아닌,
미래 투자 전략 수립을 위한 정밀한 복기 도구

일반 증권사 앱이나 마이데이터 서비스에서는 제공하지 않는
매도 중심 매칭, 매도 우선 사고 흐름, 수동 트레이드 조합 관리 지원

### 🧱 기술 스택
Backend: Express.js + Prisma + PostgreSQL
Frontend: Next.js (App Router), React, Zustand

### 🔧 향후 계획
 수익률 그래프 구현
 월별 요약 리포트 기능
 모바일 대응 UI 개선


### 🙋‍♂️ 왜 만들었나요?
이 프로젝트는 단순히 “얼마 벌었는가”가 아니라,
**"어떤 판단을 했고, 그 판단이 어떤 결과로 이어졌는가"**를 기록하기 위해 시작했습니다.

직관적인 매칭과 수정 기능을 통해
실전 매매 흐름을 다시 되짚어보고 복기하는 데 중점을 둡니다.

