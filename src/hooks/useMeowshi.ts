import { Fraction } from '../entities'
import { ethers } from 'ethers'
import { useCallback, useEffect, useState } from 'react'
import useActiveWeb3React from '../hooks/useActiveWeb3React'
import { useMeowshiContract, useSushiContract, useSushiBarContract } from '../hooks/useContract'
import { useTransactionAdder } from '../state/transactions/hooks'
import { BalanceProps } from './useTokenBalance'

const { BigNumber } = ethers

const useMaker = () => {
    const { account } = useActiveWeb3React()

    const addTransaction = useTransactionAdder()
    const sushiContract = useSushiContract(true) // withSigner
    const sushiBarContract = useSushiBarContract(true) // withSigner
    const meowshiContract = useMeowshiContract(true) // withSigner

    // Allowance
    const [allowance, setAllowance] = useState('0')
    const fetchSushiAllowance = useCallback(async () => {
        if (account) {
            try {
                const allowance = await sushiContract?.allowance(account, meowshiContract?.address)
                console.log('allowance', allowance)
                const formatted = Fraction.from(BigNumber.from(allowance), BigNumber.from(10).pow(18)).toString()
                setAllowance(formatted)
            } catch (error) {
                setAllowance('0')
                throw error
            }
        }
    }, [account, meowshiContract?.address, sushiContract])
    useEffect(() => {
        if (account && meowshiContract && sushiContract) {
            fetchSushiAllowance()
        }
        const refreshInterval = setInterval(fetchSushiAllowance, 10000)
        return () => clearInterval(refreshInterval)
    }, [account, fetchSushiAllowance, meowshiContract, sushiContract])

    const fetchSushiBarAllowance = useCallback(async () => {
        if (account) {
            try {
                const allowance = await sushiBarContract?.allowance(account, meowshiContract?.address)
                console.log('allowance', allowance)
                const formatted = Fraction.from(BigNumber.from(allowance), BigNumber.from(10).pow(18)).toString()
                setAllowance(formatted)
            } catch (error) {
                setAllowance('0')
                throw error
            }
        }
    }, [account, meowshiContract?.address, sushiBarContract])
    useEffect(() => {
        if (account && meowshiContract && sushiBarContract) {
            fetchSushiBarAllowance()
        }
        const refreshInterval = setInterval(fetchSushiBarAllowance, 10000)
        return () => clearInterval(refreshInterval)
    }, [account, fetchSushiBarAllowance, meowshiContract, sushiBarContract])

    // Approve
    const sushiApprove = useCallback(async () => {
        try {
            const tx = await sushiContract?.approve(meowshiContract?.address, ethers.constants.MaxUint256.toString())
            return addTransaction(tx, { summary: 'Sushi Approve' })
        } catch (e) {
            return e
        }
    }, [addTransaction, meowshiContract?.address, sushiContract])

    const sushiBarApprove = useCallback(async () => {
        try {
            const tx = await sushiBarContract?.approve(meowshiContract?.address, ethers.constants.MaxUint256.toString())
            return addTransaction(tx, { summary: 'SushiBar Approve' })
        } catch (e) {
            return e
        }
    }, [addTransaction, meowshiContract?.address, sushiBarContract])

    // Meowshi Sushi - xSUSHI - NYAN
    const nyanSushi = useCallback(
        async (amount: BalanceProps | undefined) => {
            if (amount?.value) {
                try {
                    const tx = await meowshiContract?.nyanSushi(account, amount?.value)
                    return addTransaction(tx, { summary: 'SUSHI -> xSUSHI -> NYAN' })
                } catch (e) {
                    return e
                }
            }
        },
        [addTransaction, meowshiContract]
    )

    const nyan = useCallback(
        async (amount: BalanceProps | undefined) => {
            if (amount?.value) {
                try {
                    const tx = await meowshiContract?.nyan(account, amount?.value)
                    return addTransaction(tx, { summary: 'xSUSHI -> NYAN' })
                } catch (e) {
                    return e
                }
            }
        },
        [addTransaction, meowshiContract]
    )

    return { allowance, sushiApprove, sushiBarApprove, nyanSushi, nyan }
}

export default useMaker
